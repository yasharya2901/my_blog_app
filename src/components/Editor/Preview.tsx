import { useEffect, useState } from "react";
import { privateBlogApi } from "../../lib/api/blog";
import type { Blog } from "../../lib/types/blog";
import { marked } from "marked";
import { getTagColor } from "../../lib/utils/tag-colors";
import { FaCalendarDays, FaUser, FaXTwitter, FaInstagram, FaWhatsapp, FaSignalMessenger, FaArrowLeft } from "react-icons/fa6";
import toast from "react-hot-toast";
import { $router } from "../../lib/stores/router";
import { redirectPage } from "@nanostores/router";
import BlogLoader from "../Loader/BlogLoader";
import RouteError from "../ErrorPages/RouteError";

// Helper to extract border color from getTagColor result
const getBorderColor = (tagColorClass: string) => {
    const match = tagColorClass.match(/bg-\[(#[A-Fa-f0-9]+)\]/);
    return match ? match[1] : '#4ADE80';
};

function Preview({ blogId }: { blogId: string }) {
    const [blog, setBlog] = useState<Blog | null>(null);
    const [blogHtml, setBlogHtml] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [authError, setAuthError] = useState<boolean>(false);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const fetchedBlog = await privateBlogApi.getBlogById(blogId);
                setBlog(fetchedBlog);
                const html = await marked.parse(fetchedBlog.content || "");
                setBlogHtml(html);
            } catch (error: any) {
                if (error?.message?.includes("Authentication required") || error?.status === 403) {
                    setAuthError(true);
                } else {
                    toast.error("Failed to load blog preview");
                }
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchBlog();
    }, [blogId]);

    const handleTagClick = (slug: string) => {
        console.log('Tag clicked:', slug);
    };

    const handleBackToEditor = () => {
        redirectPage($router, "editor", { blogId });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <BlogLoader />
            </div>
        );
    }

    if (authError || !blog) {
        return <RouteError />;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            {/* Back to Editor Button */}
            <button
                onClick={handleBackToEditor}
                className="flex items-center gap-2 text-[#4ADE80] hover:text-[#3FC16F] mb-8 transition duration-300"
            >
                <FaArrowLeft className="h-4 w-4" />
                <span>Back to Editor</span>
            </button>

            {/* Preview Badge */}
            <div className="mb-6">
                <span className="bg-[#4ADE80] text-black px-3 py-1 rounded-full text-sm font-bold">
                    PREVIEW MODE
                </span>
            </div>

            {/* Header */}
            <header className="mb-8">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">
                    {blog.title || "Untitled Blog"}
                </h1>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center text-gray-400 mb-6 gap-4">
                    <div className="flex items-center">
                        <FaCalendarDays className="h-5 w-5 mr-2 text-[#4ADE80]" />
                        {blog.datePublished ? (
                            <time dateTime={blog.datePublished}>
                                {new Date(blog.datePublished).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </time>
                        ) : (
                            <span className="text-yellow-500 italic">Not Published Yet</span>
                        )}
                    </div>
                    <div className="flex items-center">
                        <FaUser className="h-5 w-5 mr-2 text-[#C084FC]" />
                        <span>
                            Written by{" "}
                            <span className="text-[#4ADE80] hover:underline cursor-pointer">
                                {blog.author.name}
                            </span>
                        </span>
                    </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {blog.tags && blog.tags.length > 0 ? (
                        blog.tags.map((tag) => {
                            const colorClass = getTagColor(tag.name);
                            const borderColor = getBorderColor(colorClass);
                            return (
                                <button
                                    key={tag._id}
                                    className="bg-[#171717] px-3 py-1 rounded-full text-sm transition duration-300 border hover:!text-white"
                                    style={{
                                        color: borderColor,
                                        borderColor: borderColor,
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = borderColor;
                                        e.currentTarget.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#171717';
                                        e.currentTarget.style.color = borderColor;
                                    }}
                                    onClick={() => handleTagClick(tag.slug)}
                                >
                                    #{tag.name}
                                </button>
                            );
                        })
                    ) : (
                        <span className="text-gray-500 italic text-sm">No tags added</span>
                    )}
                </div>
            </header>

            {/* Blog Content */}
            {blogHtml ? (
                <article
                    className="prose prose-lg prose-blog max-w-none text-gray-300"
                    dangerouslySetInnerHTML={{ __html: blogHtml }}
                />
            ) : (
                <div className="text-gray-500 italic py-10 text-center border border-dashed border-gray-700 rounded-lg">
                    No content yet. Start writing in the editor!
                </div>
            )}

            {/* Footer Actions */}
            <div className="mt-10 pt-10 border-t border-gray-700">
                <div className="flex items-center justify-end flex-wrap gap-4">
                    {/* Social Share */}
                    <div className="flex gap-3">
                        <button
                            className="text-[#60A5FA] hover:text-[#4ADE80] transition duration-300"
                            onClick={() => console.log('Share to Twitter clicked')}
                        >
                            <FaXTwitter className="h-6 w-6" />
                        </button>
                        <button
                            className="text-[#C084FC] hover:text-[#4ADE80] transition duration-300"
                            onClick={() => console.log('Share to Instagram clicked')}
                        >
                            <FaInstagram className="h-6 w-6" />
                        </button>
                        <button
                            className="text-[#60A5FA] hover:text-[#4ADE80] transition duration-300"
                            onClick={() => console.log('Share to Signal clicked')}
                        >
                            <FaSignalMessenger className="h-6 w-6" />
                        </button>
                        <button
                            className="text-[#4ADE80] hover:text-[#3FC16F] transition duration-300"
                            onClick={() => console.log('Share to WhatsApp clicked')}
                        >
                            <FaWhatsapp className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Preview;