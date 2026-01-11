import { useEffect, useState } from "react";
import { marked } from "marked";
import { getTagColor } from "../../lib/utils/tag-colors";
import { blogApi } from "../../lib/api/blog";
import type { Blog } from "../../lib/types/blog";
import { FaCalendarDays, FaUser, FaXTwitter, FaInstagram, FaWhatsapp, FaSignalMessenger } from "react-icons/fa6";
import RouteError from "../ErrorPages/RouteError";

interface BlogContentProps {
    slug: string;
    initialBlog?: Blog | null;
}

const getBorderColor = (tagColorClass: string) => {
    const match = tagColorClass.match(/bg-\[(#[A-Fa-f0-9]+)\]/);
    return match ? match[1] : '#4ADE80';
};

export default function BlogContent({ slug, initialBlog = null }: BlogContentProps) {
    const [blog, setBlog] = useState<Blog | null>(initialBlog);
    const [blogHtml, setBlogHtml] = useState("");
    const [loading, setLoading] = useState(!initialBlog);
    const [error, setError] = useState(false);

    useEffect(() => {
        // If no initial blog, fetch from client
        if (!initialBlog) {
            blogApi.getABlogUsingSlug(slug)
                .then(async (data) => {
                    setBlog(data);
                    const html = await marked.parse(data.content);
                    setBlogHtml(html);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error("Failed to fetch blog:", err);
                    setError(true);
                    setLoading(false);
                });
        } else {
            // Parse markdown for initial blog
            const parseMarkdown = async () => {
                const html = await marked.parse(initialBlog.content);
                setBlogHtml(html);
            };
            parseMarkdown();
        }
    }, [slug, initialBlog]);

    useEffect(() => {
        if (!blog) return;

        // Tag click handlers
        const tagButtons = document.querySelectorAll('.tag-btn');
        tagButtons.forEach(btn => {
            const button = btn as HTMLButtonElement;
            const hoverBg = button.dataset.hoverBg;
            
            const handleMouseEnter = () => {
                if (hoverBg) {
                    button.style.backgroundColor = hoverBg;
                    button.style.color = 'white';
                }
            };
            
            const handleMouseLeave = () => {
                button.style.backgroundColor = '#171717';
                button.style.color = hoverBg || '#4ADE80';
            };
            
            const handleClick = () => {
                const slug = button.dataset.slug;
                console.log('Tag clicked:', slug);
            };
            
            button.addEventListener('mouseenter', handleMouseEnter);
            button.addEventListener('mouseleave', handleMouseLeave);
            button.addEventListener('click', handleClick);
        });

        // Social share handlers
        const getShareText = (platform: string) => {
            const base = `📖 ${blog.title}\nby ${blog.author.name}\n\n`;
            const blogUrl = window.location.href;

            switch (platform) {
                case 'twitter':
                    return `${base}Worth your time 👇\n${blogUrl}`;
                case 'whatsapp':
                case 'signal':
                    return `Hey! 👋\n\n${base}Thought you might like it 😊\n${blogUrl}`;
                default:
                    return `${base}${blogUrl}`;
            }
        };

        const shareTwitter = () => {
            const text = getShareText('twitter');
            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
            window.open(twitterUrl, '_blank');
        };

        const shareInstagram = () => {
            const text = getShareText('instagram');
            navigator.clipboard.writeText(text).then(() => {
                alert('Caption copied to clipboard! Open Instagram to share.');
            }).catch(() => {
                alert('Failed to copy. Please share manually.');
            });
        };

        const shareSignal = () => {
            const text = getShareText('signal');
            if (navigator.share) {
                navigator.share({
                    title: blog.title,
                    text: text,
                    url: window.location.href
                }).catch(() => {
                    navigator.clipboard.writeText(text);
                    alert('Copied to clipboard! Open Signal to share.');
                });
            } else {
                navigator.clipboard.writeText(text).then(() => {
                    alert('Copied to clipboard! Open Signal to share.');
                });
            }
        };

        const shareWhatsapp = () => {
            const text = getShareText('whatsapp');
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
            window.open(whatsappUrl, '_blank');
        };

        document.getElementById('share-twitter')?.addEventListener('click', shareTwitter);
        document.getElementById('share-instagram')?.addEventListener('click', shareInstagram);
        document.getElementById('share-signal')?.addEventListener('click', shareSignal);
        document.getElementById('share-whatsapp')?.addEventListener('click', shareWhatsapp);

        return () => {
            tagButtons.forEach(btn => {
                btn.removeEventListener('mouseenter', () => {});
                btn.removeEventListener('mouseleave', () => {});
                btn.removeEventListener('click', () => {});
            });
            document.getElementById('share-twitter')?.removeEventListener('click', shareTwitter);
            document.getElementById('share-instagram')?.removeEventListener('click', shareInstagram);
            document.getElementById('share-signal')?.removeEventListener('click', shareSignal);
            document.getElementById('share-whatsapp')?.removeEventListener('click', shareWhatsapp);
        };
    }, [blog]);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12 text-center">
                <div className="text-[#4ADE80] text-xl">Loading...</div>
            </div>
        );
    }

    if (error || !blog) {
        return <RouteError />;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            {/* Header */}
            <header className="mb-8">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">{blog.title}</h1>
                
                {/* Meta Info */}
                <div className="flex flex-wrap items-center text-gray-400 mb-6 gap-4">
                    <div className="flex items-center">
                        <FaCalendarDays className="h-5 w-5 mr-2 text-[#4ADE80]" />
                        <time dateTime={blog.datePublished ?? ""}>
                            {new Date(blog.datePublished ?? "").toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </time>
                    </div>
                    <div className="flex items-center">
                        <FaUser className="h-5 w-5 mr-2 text-[#C084FC]" />
                        <span>Written by <a href="https://www.yasharya.me" target="_blank" className="text-[#4ADE80] hover:underline cursor-pointer">{blog.author.name}</a></span>
                    </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {blog.tags.map((tag) => {
                        const colorClass = getTagColor(tag.name);
                        const borderColor = getBorderColor(colorClass);
                        return (
                            <button 
                                key={tag._id}
                                className="tag-btn bg-[#171717] px-3 py-1 rounded-full text-sm transition duration-300 border"
                                style={{
                                    color: borderColor,
                                    borderColor: borderColor
                                }}
                                data-slug={tag.slug}
                                data-hover-bg={borderColor}
                            >
                                #{tag.name}
                            </button>
                        );
                    })}
                </div>
            </header>

            {/* Blog Content */}
            <article className="prose prose-lg prose-blog max-w-none text-gray-300" dangerouslySetInnerHTML={{ __html: blogHtml }} />

            {/* Footer Actions */}
            <div className="mt-10 pt-10 border-t border-gray-700">
                <div className="flex items-center justify-end flex-wrap gap-4">
                    {/* Social Share */}
                    <div className="flex gap-3">
                        <button id="share-twitter" className="text-[#60A5FA] hover:text-[#4ADE80] transition duration-300">
                            <FaXTwitter className="h-6 w-6" />
                        </button>
                        <button id="share-instagram" className="text-[#C084FC] hover:text-[#4ADE80] transition duration-300">
                            <FaInstagram className="h-6 w-6" />
                        </button>
                        <button id="share-signal" className="text-[#60A5FA] hover:text-[#4ADE80] transition duration-300">
                            <FaSignalMessenger className="h-6 w-6" />
                        </button>
                        <button id="share-whatsapp" className="text-[#4ADE80] hover:text-[#3FC16F] transition duration-300">
                            <FaWhatsapp className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}