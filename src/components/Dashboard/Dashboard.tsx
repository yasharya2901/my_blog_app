import { useEffect, useState } from 'react'
import { $authLoading, $user, logout } from '../../lib/stores/auth'
import { useStore } from '@nanostores/react';
import AuthLoader from '../Loader/AuthLoader';
import { FaChevronDown, FaPlus, FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import { CiLogout } from 'react-icons/ci';
import { type StrippedTag } from '../../lib/types/tags';
import { tagApi } from '../../lib/api/tag';
import toast from 'react-hot-toast';
import { privateBlogApi } from '../../lib/api/blog';
import BlogCards from '../BlogCards/BlogCards';
import type { Blog } from '../../lib/types/blog';
import { $router } from '../../lib/stores/router';
import { redirectPage } from '@nanostores/router';

function Dashboard() {

    const user = useStore($user);
    const authLoading = useStore($authLoading);
    const [activeTagSlug, setActiveTagSlug] = useState<string>('all');
    const [tags, setTags] = useState<StrippedTag[]>([]);
    const [tagDetail, setTagDetail] = useState({limit: 5, offset: 0});
    const [tagPaginationState, setTagPaginationState] = useState({
        hasMore: false,
        isLoading: false
    });
    const [blogDetail, setBlogDetail] = useState({limit: 9, offset: 0});
    const [fetchPublishedBlogs, setFetchPublishedBlogs] = useState<boolean>(false);
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [prevDisabled, setPrevDisabled] = useState<boolean>(false);
    const [nextDisabled, setNextDisabled] = useState<boolean>(false);
    const [blogLoading, setBlogLoading] = useState<boolean>(false);

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

    // useEffect for the AuthLoading animation
    useEffect(() => {
        if (!minDelayPassed) {
            const timer = setTimeout(() => {
                setMinDelayPassed(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [minDelayPassed]);

    // useEffect for getting tags
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

    // useEffect for loading blogs
    useEffect(() => {
        let isMounted = true;
        const loadBlogs = async () => {
            setBlogLoading(true);
            const Blogs = await fetchBlogs();
            if (isMounted) {
                Blogs.length < blogDetail.limit ? setNextDisabled(true) : setNextDisabled(false);
                blogDetail.offset == 0 ? setPrevDisabled(true) : setPrevDisabled(false)
                setBlogs(Blogs);
                setBlogLoading(false);
            }
        }

        loadBlogs();
        return () => {
            isMounted = false
        }
    }, [activeTagSlug, fetchPublishedBlogs, blogDetail.offset])

    const handleLogOut = async () => {
        await logout();
    }

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm("Delete this blog post?")) {
            return;
        }
        try {
            const res = await privateBlogApi.deleteABlog(id);
            if (res.success) {
                toast.success("Blog Deleted Successfully");
            } else {
                toast.error("Oops, something went wrong")
            }
        } catch (error: any) {
            toast.error("Something bad happened at the server")
        }

        const blogs = await fetchBlogs();
        setBlogs(blogs);
    }

    const handleTagClick = async (slug: string) => {
        try {
            setActiveTagSlug(slug);
            setBlogs([]);
            setBlogDetail(prev => ({
                limit: prev.limit,
                offset: 0
            }));
        } catch (error: any) {
            toast.error("Error ")
        }
    }

    const handleCreateBlog = async () => {
        try {
            const newBlog = await privateBlogApi.createABlog();
            toast.success(`New Blog Created${fetchPublishedBlogs ? `. Please uncheck "Show Published Blogs" to see and edit the blog.` : ""}`);
            redirectPage($router, "editor", {blogId: newBlog._id});
        } catch (error: any) {
            toast.error(error?.message || "Error Creating a Blog")
        }
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

    const fetchBlogs = async () => {
        if (activeTagSlug == 'all') {
            return await privateBlogApi.getAllBlogs(blogDetail.limit, blogDetail.offset, fetchPublishedBlogs);
        }

        return await privateBlogApi.getAllBlogsOfTag(activeTagSlug, blogDetail.limit, blogDetail.offset, fetchPublishedBlogs);
    }

    const movePage = async (where: string) => {
        if (blogLoading) return;
        switch (where) {
            case "prev":
                if (blogDetail.offset == 0) return;
                setBlogDetail(prev => ({...prev, offset: prev.offset - prev.limit}));
                return;
            
            case "next":
                setBlogDetail(prev => ({...prev, offset: prev.offset + prev.limit}));
                return;
            default:
                return;
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
                        <button 
                            className='group flex items-center gap-2 px-6 py-3 bg-transparent border-2 border-[#4ADE80] rounded-lg text-white hover:bg-[#4ADE80] hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(74,222,128,0.1)] hover:shadow-[0_0_25px_rgba(74,222,128,0.4)]'
                            onClick={handleCreateBlog}
                        >
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
                    onClick={(e) => {
                        handleTagClick("all")
                    }}
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
                        onClick={(e) => {
                            handleTagClick(tag.slug)
                        }}
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
            </div>
            <label className='px-5 text-lg flex gap-3 my-3 items-center text-gray-300 cursor-pointer mb-8'>
                <input 
                    className=' w-5 h-5 accent-[#4ADE80] bg-[#171717] border border-gray-700 rounded cursor-pointer transition-all focus:ring-2 focus:ring-[#4ADE80] focus:ring-offset-2 focus:ring-offset-[#0a0a0a]'
                    type='checkbox'
                    checked={fetchPublishedBlogs}
                    onChange={() => {
                        setFetchPublishedBlogs((prev) => !prev);
                        setBlogDetail(prev => ({...prev, offset: 0}));
                    }}
                />
                Show Published Blogs
            </label>
            {/* Blog Cards */}
            <div className='px-5 mt-2 mb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                {(blogs.length == 0) ? (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 border border-dashed border-gray-800 rounded-xl bg-[#111]">
                        <div className="text-gray-500 text-xl mb-2 font-medium">No blogs found</div>
                        <p className="text-gray-600 text-sm px-4">Try adjusting your filters or create a new blog to get started.</p>
                    </div>
                ) : blogs.map((blog)=> {
                    return (<BlogCards 
                        _id={blog._id}  
                        author={blog.author}
                        datePublished={blog.datePublished}
                        slug={blog.slug}
                        shortDescription={blog.shortDescription}
                        tags={blog.tags}
                        title={blog.title}
                        key={blog._id}
                        allowEditAndDelete={true}
                        handleClick={() => $router.open(`/editor/${blog._id}`)}
                        handleDelete={(e) => {handleDelete(e, blog._id)}}
                    />)
                })}
            </div>

            {/* Prev - Next button */}
            <div className='flex justify-center gap-10 pb-20'>
                <button 
                    onClick={() => movePage("prev")} 
                    disabled={prevDisabled}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg border-2 font-bold transition-all duration-300 ${
                        prevDisabled 
                        ? "border-gray-700 text-gray-600 cursor-not-allowed opacity-50" 
                        : "border-[#4ADE80] text-[#4ADE80] hover:bg-[#4ADE80] hover:text-black hover:shadow-[0_0_15px_rgba(74,222,128,0.4)]"
                    }`}
                >
                    <FaChevronLeft /> Prev
                </button>
                <button 
                    onClick={() => movePage("next")} 
                    disabled={nextDisabled}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg border-2 font-bold transition-all duration-300 ${
                        nextDisabled 
                        ? "border-gray-700 text-gray-600 cursor-not-allowed opacity-50" 
                        : "border-[#4ADE80] text-[#4ADE80] hover:bg-[#4ADE80] hover:text-black hover:shadow-[0_0_15px_rgba(74,222,128,0.4)]"
                    }`}
                >
                    Next <FaChevronRight />
                </button>
            </div>
        </div>
    
    </>
  )
}

export default Dashboard