import { useEffect, useState } from 'react'
import { $authLoading, $user, logout } from '../../lib/stores/auth'
import { useStore } from '@nanostores/react';
import AuthLoader from '../AuthLoader/AuthLoader';
import { FaChevronDown, FaPlus } from 'react-icons/fa6';
import { CiLogout } from 'react-icons/ci';
import { type StrippedTag, type Tag } from '../../lib/types/tags';
import { tagApi } from '../../lib/api/tag';
import toast from 'react-hot-toast';

function Dashboard() {

    const user = useStore($user);
    const authLoading = useStore($authLoading);
    const [activeTagSlug, setActiveTagSlug] = useState<string>('all');
    const [tags, setTags] = useState<StrippedTag[]>([]);
    const [tagDetail, setTagDetail] = useState({limit: 5, offset:0});
    const [tagPaginationState, setTagPaginationState] = useState({
        hasMore: false,
        isLoading: false
    });

    const [isFromLoginRedirect] = useState<boolean>(() => {
        if (typeof window !== "undefined") {
            const isRedirect = sessionStorage.getItem("from_login_redirect");
            if (isRedirect) {
                sessionStorage.removeItem("from_login_redirect");
                return true; 
            }
        }
        return false;
    });

    const [minDelayPassed, setMinDelayPassed] = useState<boolean>(false);

    useEffect(() => {
        if (!minDelayPassed) {
            const timer = setTimeout(() => {
                setMinDelayPassed(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [minDelayPassed]);

    useEffect(() => {
        let isMounted = true;
        const getTags = async() => {
            const tagResponse = await tagApi.getAllTags(tagDetail.limit, tagDetail.offset);
            if (isMounted) {
                setTags(tagResponse.tags);
                setTagDetail(prev => ({
                    limit: prev.limit,
                    offset: prev.limit + prev.offset
                }));
                if (tagResponse.tags.length < tagResponse.total) {
                    setTagPaginationState(prev => ({ ...prev, hasMore: true }));
                }
            }
        }

        getTags();
        
        return () => {
            isMounted = false;
        };
    }, [])

    const handleLogOut = async () => {
        await logout();
    }

    const fetchMoreTags = async () => {
        if (tagPaginationState.isLoading) return;
        try {
            setTagPaginationState(prev => ({ ...prev, isLoading: true }));
            const tagsResp = await tagApi.getAllTags(tagDetail.limit, tagDetail.offset);
            setTags(prevTags =>{ 
                const hasMore = prevTags.length + tagsResp.tags.length < tagsResp.total;
                setTagPaginationState(prev => ({ ...prev, hasMore }));
                return [...prevTags, ...tagsResp.tags]
            });
            setTagDetail(prev => ({
                limit: prev.limit,
                offset: prev.offset + prev.limit
            }))
    
            
        } catch (error: any) {
            toast.error(error?.message || "Failed to load tags, please try again")
        } finally {
            setTagPaginationState(prev => ({ ...prev, isLoading: false }));
        }
    }

    const showLoader = (authLoading || !minDelayPassed) && !isFromLoginRedirect;

    if (showLoader) {
        return <AuthLoader />;
    }

    if (!user && !authLoading) {
        window.location.href = "/login"
        return null;
    }
  return (
    <>
        <div className='max-w-7xl mx-auto'>
            <nav className='px-4 py-12'>
                <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6'>
                    <div className='flex flex-col gap-2'>
                        <div className='text-4xl font-bold'>My <span className='text-[#4ADE80]'>Blogs</span></div>
                        <p className='text-gray-400 text-sm'>Manage your content and thoughts.</p>
                    </div>

                    <div className='flex gap-4'>
                        <button className='group flex items-center gap-2 px-6 py-3 bg-transparent border-2 border-[#4ADE80] rounded-lg text-white hover:bg-[#4ADE80] hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(74,222,128,0.1)] hover:shadow-[0_0_25px_rgba(74,222,128,0.4)]'>
                            <FaPlus className='text-sm group-hover:rotate-90 transition-transform duration-300'/> <span className='font-bold'>Create New Blog</span>
                        </button>
                        <button className='group flex justify-center items-center gap-2 px-4 py-3 bg-transparent hover:border-2 border-[#4ADE80] rounded-lg text-white hover:bg-[#4ADE80] hover:text-black transition-all duration-300 w-14 hover:w-auto  hover:shadow-[0_0_25px_rgba(74,222,128,0.4)]' onClick={handleLogOut}>
                            <CiLogout className='text-xl' />
                            <span className='max-w-0 opacity-0 overflow-hidden group-hover:max-w-xs group-hover:opacity-100 font-bold whitespace-nowrap transition-all duration-300'>Log Out</span>
                        </button>
                    </div>
                </div>
            </nav>
            
            {/* --- Tags Filter --- */}
            <div className="flex flex-wrap gap-3 mb-12 animate__animated animate__fadeIn px-4">
            {/* "All" Button */}
            <button
                onClick={() => setActiveTagSlug("all")}
                className={`
                px-5 py-2 rounded-lg border transition-all duration-300 font-medium text-sm
                ${activeTagSlug === "all"
                    ? "bg-[#4ADE80] text-black border-[#4ADE80] shadow-[0_0_15px_rgba(74,222,128,0.3)] scale-105"
                    : "bg-[#171717] text-gray-300 border-gray-700 hover:border-[#4ADE80] hover:text-[#4ADE80]"
                }
                `}
            >
                All
            </button>

            {/* Dynamic Tags from DB */}
            {tags.map((tag) => (
                <button
                key={tag._id}
                onClick={() => setActiveTagSlug(tag.slug)}
                className={`
                    px-5 py-2 rounded-lg border transition-all duration-300 font-medium text-sm
                    ${activeTagSlug === tag.slug
                    ? "bg-[#4ADE80] text-black border-[#4ADE80] shadow-[0_0_15px_rgba(74,222,128,0.3)] scale-105"
                    : "bg-[#171717] text-gray-300 border-gray-700 hover:border-[#4ADE80] hover:text-[#4ADE80]"
                    }
                `}
                >
                {tag.name}
                </button>
            ))}


            {/* Expand Button */}
            {tagPaginationState.hasMore  && (
                <button
                    onClick={fetchMoreTags}
                    className={`px-5 py-2 rounded-lg bg-[#171717] border border-gray-700 text-white ${!tagPaginationState.isLoading && "hover:bg-gray-800 hover:border-gray-500"} transition-all duration-300 flex items-center gap-2 text-sm group`}
                    disabled={tagPaginationState.isLoading}
                >
                    <span>{tagPaginationState.isLoading ? "Loading" :"More"}</span>
                    {!tagPaginationState.isLoading && (<FaChevronDown className="text-xs text-[#4ADE80] group-hover:translate-y-1 transition-transform" />)}
                </button>
            )}

            {/* Blog Cards*/}

            </div>
        </div>
    
    </>
  )
}

export default Dashboard