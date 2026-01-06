import { useEffect, useState } from "react";
import { blogApi, privateBlogApi } from "../../lib/api/blog";
import { privateTagApi } from "../../lib/api/tag";
import type { Blog } from "../../lib/types/blog";
import type { Tag } from "../../lib/types/tags";
import MarkdownEditor from "./MarkdownEditor";
import { FaArrowLeft, FaCheck, FaFloppyDisk, FaRotate, FaPlus } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";

import toast from "react-hot-toast";
import RouteError from "../ErrorPages/RouteError";

const SHORT_DESCRIPTION_MAX_LENGTH = 200;

function Editors({ blogId }: { blogId: string }) {

    const [blog, setBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [slugButtonState, setSlugButtonState] = useState<boolean>(true);
    const [isSlugVerified, setIsSlugVerified] = useState<boolean | null> (null);
    
    // Tag Search State
    const [tagSearchQuery, setTagSearchQuery] = useState<string>("");
    const [tagSearchResults, setTagSearchResults] = useState<Tag[]>([]);
    const [showTagDropdown, setShowTagDropdown] = useState<boolean>(false);

    // Track content and images from MarkdownEditor
    const [markdownContent, setMarkdownContent] = useState<string>("");
    const [markdownImages, setMarkdownImages] = useState<Record<string, string>>({});
    
    const loadBlog = async () => {
        try {
            const blog = await privateBlogApi.getBlogById(blogId)
            setBlog(blog)
            setLoading(false);
        } catch (error) {
            toast.error("Failed to load blog");
            setLoading(false);
        }
    }

    const handleContentChange = (content: string, images: Record<string, string>) => {
        setMarkdownContent(content);
        setMarkdownImages(images);
    }

    const handleSave = async () => {
        if (!blog) return;
        
        if (blog.shortDescription.length > SHORT_DESCRIPTION_MAX_LENGTH) {
            toast.error(`Short description is too long (max ${SHORT_DESCRIPTION_MAX_LENGTH} characters)`);
            return;
        }

        setSaving(true);
        
        // Replace placeholders with full base64 images
        let fullContent = markdownContent;
        Object.entries(markdownImages).forEach(([id, base64]) => {
            fullContent = fullContent.replace(new RegExp(`{{${id}}}`, 'g'), base64);
        });
        
        try {
            await privateBlogApi.updateABlog(blogId, { 
                ...blog, 
                content: fullContent 
            });
            toast.success("Blog saved successfully!");
        } catch (error) {
            toast.error("Failed to save blog");
        } finally {
            setSaving(false);
        }
    }

    const handleSlug = async () => {
        if (!blog) return;

        setSlugButtonState(false);

        if (!blog?.slug) {
            try {
                const res = await privateBlogApi.generateSlug(blog.title);
                setBlog((prev) => prev ? {...prev, slug: res.slug} : null);
            } catch (error) {
                toast.error("Error Generating Slug");
            } finally {
                setSlugButtonState(true);
            }
        }

        try {
            const res = await privateBlogApi.verifySlug(blog.slug);
            setIsSlugVerified(res.available);
        } catch (error) {
            setIsSlugVerified(null);
        } finally {
            setSlugButtonState(true);
        }
    }

    // Debounce Tag Search
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (tagSearchQuery.trim()) {
                try {
                    const tags = await privateTagApi.searchTag(tagSearchQuery, 10, 0);
                    setTagSearchResults(tags);
                    setShowTagDropdown(true);
                } catch (error) {
                    console.error("Error searching tags", error);
                }
            } else {
                setTagSearchResults([]);
                setShowTagDropdown(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [tagSearchQuery]);

    const handleAddTag = (tag: Tag) => {
        if (!blog) return;
        if (blog.tags.some(t => t._id === tag._id)) {
            setTagSearchQuery("");
            setShowTagDropdown(false);
            return;
        }
        
        setBlog(prev => prev ? { ...prev, tags: [...prev.tags, tag] } : null);
        setTagSearchQuery("");
        setShowTagDropdown(false);
    }

    const handleCreateTag = async (name: string) => {
        try {
            const newTag = await privateTagApi.createTag(name);
            handleAddTag(newTag);
            toast.success(`Tag "${name}" created`);
        } catch (error) {
            toast.error("Failed to create tag");
        }
    }

    const handleRemoveTag = (tagId: string) => {
        setBlog(prev => prev ? { ...prev, tags: prev.tags.filter(t => t._id !== tagId) } : null);
    }

    useEffect(() => {
        loadBlog();
    }, [])

    if (loading) {
        return <div className="max-w-5xl mx-auto px-4 py-8 text-center text-gray-400">Loading...</div>
    }

    if (!blog) {
        return <RouteError/>
    }

    return (<>
        <div className="max-w-5xl mx-auto px-4 py-12 animate__animated animate__fadeIn">
            {/* Header */}
            <div className="flex justify-between items-center mb-12 border-b border-gray-800 pb-6">
                <button onClick={() => window.history.back()} className="group flex items-center gap-2 text-gray-400 hover:text-[#4ADE80] transition-colors duration-300">
                    <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-300"/> <span className="font-medium">Back to Dashboard</span>
                </button>
            </div>

            {/* Title */}
            <div className="mb-8">
                <label className="text-gray-400 text-sm font-medium mb-2 block">Title</label>
                <input 
                    className="bg-[#171717] border border-gray-700 text-white rounded-lg px-4 py-3 focus:border-[#4ADE80] focus:outline-none focus:ring-1 focus:ring-[#4ADE80] transition-all duration-300 w-full text-lg font-semibold placeholder-gray-600"
                    value={blog.title} 
                    name="Title" 
                    type="text" 
                    placeholder="Enter blog title..."
                    onChange={(e) => setBlog((prev) => prev ? { ...prev, title: e.target.value } : null)} 
                />
            </div>

            {/* Slug */}
            <div className="mb-8">
                <label className="text-gray-400 text-sm font-medium mb-2 block">Slug</label>
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <input 
                            className={`bg-[#171717] border border-gray-700 text-white rounded-lg px-4 py-3 focus:border-[#4ADE80] focus:outline-none focus:ring-1 focus:ring-[#4ADE80] transition-all duration-300 w-full ${isSlugVerified === true ? 'border-green-500/50' : isSlugVerified === false ? 'border-red-500/50' : ''}`}
                            type="text" 
                            name="Slug" 
                            value={blog.slug} 
                            onChange={(e) => setBlog((prev) => prev ? {...prev, slug: e.target.value} : null)} 
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            {(isSlugVerified != null) && (isSlugVerified ? <FaCheck className="text-[#4ADE80]"/> : <IoClose className="text-red-500" />)}
                        </div>
                    </div>
                    <button 
                        onClick={handleSlug} 
                        disabled={!slugButtonState}
                        className="px-6 py-3 rounded-lg bg-[#171717] border border-gray-700 text-gray-300 hover:border-[#4ADE80] hover:text-[#4ADE80] transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                        {(blog.slug) ? "Verify Slug" : "Generate Slug"}
                    </button>
                </div>
            </div>

            {/* Short Description */}
            <div className="mb-8">
                <div className="flex justify-between mb-2">
                    <label className="text-gray-400 text-sm font-medium">Short Description</label>
                    <span className={`text-xs ${blog.shortDescription.length > SHORT_DESCRIPTION_MAX_LENGTH ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                        {blog.shortDescription.length} / {SHORT_DESCRIPTION_MAX_LENGTH}
                    </span>
                </div>
                <input 
                    className={`bg-[#171717] border ${blog.shortDescription.length > SHORT_DESCRIPTION_MAX_LENGTH ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-700 focus:border-[#4ADE80] focus:ring-[#4ADE80]'} text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-1 transition-all duration-300 w-full`}
                    type="text" 
                    name="ShortDescription" 
                    value={blog.shortDescription} 
                    onChange={(e) => setBlog((prev) => prev ? {...prev, shortDescription: e.target.value} : null)} 
                />
            </div>
            {/* Tags */}
            <div className="mb-8 relative">
                <label className="text-gray-400 text-sm font-medium mb-2 block">Tags</label>
                
                {/* Selected Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                    {blog.tags?.map(tag => (
                        <span key={tag._id} className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#171717] border border-[#4ADE80] text-[#4ADE80] text-sm animate__animated animate__fadeIn">
                            {tag.name}
                            <button onClick={() => handleRemoveTag(tag._id)} className="hover:text-white transition-colors">
                                <IoClose />
                            </button>
                        </span>
                    ))}
                </div>

                {/* Search Input */}
                <input 
                    className="bg-[#171717] border border-gray-700 text-white rounded-lg px-4 py-3 focus:border-[#4ADE80] focus:outline-none focus:ring-1 focus:ring-[#4ADE80] transition-all duration-300 w-full"
                    type="text" 
                    placeholder="Search or create tags..."
                    value={tagSearchQuery}
                    onChange={(e) => setTagSearchQuery(e.target.value)}
                    onFocus={() => tagSearchQuery && setShowTagDropdown(true)}
                    onBlur={() => setTimeout(() => setShowTagDropdown(false), 200)}
                />

                {/* Dropdown */}
                {showTagDropdown && tagSearchQuery && (
                    <div className="absolute z-20 w-full mt-1 bg-[#171717] border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        {/* Create Option if no exact match */}
                        {!tagSearchResults.some(t => t.name.toLowerCase() === tagSearchQuery.toLowerCase()) && (
                            <button 
                                className="w-full text-left px-4 py-3 text-[#4ADE80] hover:bg-gray-800 transition-colors border-b border-gray-800 flex items-center gap-2"
                                onClick={() => handleCreateTag(tagSearchQuery)}
                            >
                                <FaPlus className="text-xs"/> Create "{tagSearchQuery}"
                            </button>
                        )}
                        
                        {/* Existing Tags */}
                        {tagSearchResults.map(tag => (
                            <button
                                key={tag._id}
                                className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                                onClick={() => handleAddTag(tag)}
                            >
                                {tag.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            {/* Tags */}

            <div>
                <label>Tags</label>

            </div>

            {/* Markdown Editor Component */}
            <div className="mb-8">
                <label className="text-gray-400 text-sm font-medium mb-2 block">Content</label>
                <div className="border border-gray-700 rounded-lg overflow-hidden focus-within:border-[#4ADE80] focus-within:ring-1 focus-within:ring-[#4ADE80] transition-all duration-300">
                    <MarkdownEditor 
                        initialContent={blog.content || ""}
                        onContentChange={handleContentChange}
                        readOnly={false}
                    />
                </div>
            </div>

            {/*Date Published */}
            <div className="mb-12">
                <label className="text-gray-400 text-sm font-medium mb-2 block">Publishing Date</label>
                <input 
                    className="bg-[#171717] border border-gray-700 text-white rounded-lg px-4 py-3 focus:border-[#4ADE80] focus:outline-none focus:ring-1 focus:ring-[#4ADE80] transition-all duration-300 w-full md:w-auto"
                    type="date" 
                    name="PublishingDate" 
                    value={blog.datePublished ? new Date(blog.datePublished).toISOString().split('T')[0] : ''} 
                    onChange={(e) => setBlog((prev) => prev ? {...prev, datePublished: e.target.value} : null)} 
                />
            </div>

            {/* Save Button */}
            <div className="mt-8 flex justify-end sticky bottom-8 z-10">
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="group flex items-center gap-2 px-8 py-3 bg-[#171717] border-2 border-[#4ADE80] rounded-lg text-white hover:bg-[#4ADE80] hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(74,222,128,0.1)] hover:shadow-[0_0_25px_rgba(74,222,128,0.4)] font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? <FaRotate className="animate-spin" /> : <FaFloppyDisk className="group-hover:scale-110 transition-transform"/>}
                    <span>{saving ? "Saving..." : "Save Blog"}</span>
                </button>
            </div>
        </div>
    </>);
}


export default Editors;