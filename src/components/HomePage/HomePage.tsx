import { useEffect, useState } from "react";
import type { Blog } from "../../lib/types/blog";
import { blogApi } from "../../lib/api/blog";
import toast from "react-hot-toast";
import BlogLoader from "../Loader/BlogLoader";
import BlogCards from "../BlogCards/BlogCards";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

const STORAGE_KEY = 'blog_session_cache';
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

interface BlogCache {
    blogs: Blog[];
    timestamp: number;
    offset: number;
}

function HomePage({blogs: initialBlogs, blogLimit = 3, totalBlogs}: {blogs: Blog[], blogLimit: number, totalBlogs: number | undefined}) {

    // If totalBlogs is undefined (server error), we start in loading state to fetch client-side
    const [loading, setLoading] = useState<boolean>(totalBlogs === undefined);
    const [blogs, setBlogs] = useState<Blog[]>(initialBlogs || []);
    const [totalBlogCount, setTotalBlogCount] = useState<number | undefined>(totalBlogs);
    const [viewDetails, setViewDetails] = useState({
        limit: blogLimit,
        offset: 0
    })
    const [cacheTimestamp, setCacheTimestamp] = useState<number>(Date.now());
    const [slideDirection, setSlideDirection] = useState<'left' | 'right' | ''>('');
    const [prevDisabled, setPrevDisabled] = useState<boolean>(true);
    const [nextDisabled, setNextDisabled] = useState<boolean>(true);

    // Checking for session cache
    useEffect(() => {
        if (typeof window === "undefined") return;

        const cached = sessionStorage.getItem(STORAGE_KEY);
        if (cached) {
            try {
                const parsedCache: BlogCache = JSON.parse(cached);
                const isExpired = Date.now() - parsedCache.timestamp > CACHE_TTL;
                
                // Validate: Check if cache starts with the same blog as server data (consistency check)
                // If server data (initialBlogs) is available, we use it to validate the cache head
                const isConsistent = initialBlogs && initialBlogs.length > 0 
                    ? parsedCache.blogs.length > 0 && parsedCache.blogs[0]._id === initialBlogs[0]._id
                    : true; // If no server data (error case), we blindly trust cache if not expired

                if (!isExpired && isConsistent) {
                    // Merge strategy: Keep server's fresh Page 1, append cached subsequent pages if any
                    // Actually, simpler: Just use cache if it contains *more* data than initial load
                    if (parsedCache.blogs.length > (initialBlogs?.length || 0)) {
                         // If we are restoring a state that is further ahead (offset > 0), 
                         // we should animate specifically to indicate movement to that page.
                         if (parsedCache.offset > 0) {
                            setSlideDirection('right');
                         }
                         setBlogs(parsedCache.blogs);
                         setViewDetails(prev => ({...prev, offset: parsedCache.offset}));
                         setCacheTimestamp(parsedCache.timestamp);
                    }
                } else {
                    sessionStorage.removeItem(STORAGE_KEY);
                }
            } catch (e) {
                console.error("Cache parse error", e);
                sessionStorage.removeItem(STORAGE_KEY);
            }
        }
    }, [initialBlogs]); 
    
    useEffect(() => {
        // If we have valid server data, don't fetch
        if (totalBlogs !== undefined) return;

        const loadBlogs = async () => {
            setLoading(true);
            try {
                // Fetch both count and list since server failed
                const [fetchedBlogs, countResp] = await Promise.all([
                    blogApi.getAllBlogs(blogLimit, 0),
                    blogApi.getBlogCount()
                ]);
                setBlogs(fetchedBlogs);
                setTotalBlogCount(countResp.totalCount);
                setCacheTimestamp(Date.now());
            } catch (error) {
                toast.error("Error Loading Blogs")
            } finally {
                setLoading(false)
            }
        }

        loadBlogs();
    }, [])

    useEffect(() => {
        if (typeof window === "undefined") return;

        // Sync state to cache whenever we move pages or update blogs
        // This ensures Prev/Next navigation and new fetches are always saved
        const cacheData: BlogCache = {
            blogs: blogs,
            timestamp: cacheTimestamp,
            offset: viewDetails.offset
        };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cacheData));
        
        // Check if we need to fetch more data for the current page
        if (viewDetails.offset > 0 && blogs.length <= viewDetails.offset) {
            const loadMoreBlogs = async () => {
                setLoading(true);
                try {
                    const newBlogs = await blogApi.getAllBlogs(viewDetails.limit, viewDetails.offset);
                    setBlogs(prevBlogs => [...prevBlogs, ...newBlogs]);
                    setCacheTimestamp(Date.now());
                } catch (error) {
                    toast.error("Failed to load more blogs");
                } finally {
                    setLoading(false);
                }
            }
            loadMoreBlogs();
        }
    }, [viewDetails.offset, blogs, cacheTimestamp])

    // Handle Button States
    useEffect(() => {
        setPrevDisabled(viewDetails.offset === 0);
        
        if (totalBlogCount !== undefined) {
            setNextDisabled(viewDetails.offset + viewDetails.limit >= totalBlogCount);
        }
    }, [viewDetails.offset, totalBlogCount]);

    const handleBlogCardClick = async (slug: string) => {
        // Save current state before navigating
        const cacheData: BlogCache = {
            blogs: blogs,
            timestamp: cacheTimestamp,
            offset: viewDetails.offset
        };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cacheData));
        window.location.href = `/blog/${slug}`
    }

    const movePage = async (where: string) => {
        if (loading) return;
        switch (where) {
            case "prev":
                if (viewDetails.offset == 0) return;
                setSlideDirection('left');
                setViewDetails(prev => ({...prev, offset: prev.offset - prev.limit}));
                return;
            
            case "next":
                setSlideDirection('right');
                setViewDetails(prev => ({...prev, offset: prev.offset + prev.limit}));
                return;
            default:
                return;
        }
    }


    return (
        <div className='max-w-[1800px] mx-auto px-4'>
            <div className='py-12 text-center flex flex-col gap-4 mb-8'>
                 <div className='text-4xl font-bold'>My <span className='text-[#4ADE80]'>Blogs</span></div>
                 <p className='text-gray-400'>Explore my collection of thoughts, tutorials, and insights on web development, programming, technology and science</p>
            </div>
        
            {loading ? (
                <div className="flex justify-center py-20">
                    <BlogLoader/>
                </div>
            ) : (
                <div 
                    key={viewDetails.offset}
                    className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 min-h-[250px] ${slideDirection === 'right' ? 'slide-in-right' : slideDirection === 'left' ? 'slide-in-left' : 'animate__animated animate__fadeIn'}`}
                >
                    {blogs.slice(viewDetails.offset, viewDetails.offset + viewDetails.limit).map((blog)=> 
                        <BlogCards key={blog._id} _id={blog._id} author={blog.author} slug={blog.slug} shortDescription={blog.shortDescription} tags={blog.tags} title={blog.title} datePublished={blog.datePublished} allowEditAndDelete={false} handleClick={() => handleBlogCardClick(blog.slug)} />
                    )}
                </div>
            )}

            <div className="flex justify-center gap-10 mt-8 pb-20">
                <button 
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg border-2 font-bold transition-all duration-300 ${
                        prevDisabled 
                        ? "border-gray-700 text-gray-600 cursor-not-allowed opacity-50" 
                        : "border-[#4ADE80] text-[#4ADE80] hover:bg-[#4ADE80] hover:text-black hover:shadow-[0_0_15px_rgba(74,222,128,0.4)]"
                    }`}
                    onClick={() => movePage("prev")} 
                    disabled={prevDisabled}
                >
                    <FaChevronLeft /> Prev
                </button>
                <button 
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg border-2 font-bold transition-all duration-300 ${
                        nextDisabled 
                        ? "border-gray-700 text-gray-600 cursor-not-allowed opacity-50" 
                        : "border-[#4ADE80] text-[#4ADE80] hover:bg-[#4ADE80] hover:text-black hover:shadow-[0_0_15px_rgba(74,222,128,0.4)]"
                    }`}
                    onClick={() => movePage("next")} 
                    disabled={nextDisabled}
                >
                    Next <FaChevronRight />
                </button>
            </div>
        </div>
    )
}


export default HomePage;