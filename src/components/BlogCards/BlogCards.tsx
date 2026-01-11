import { FaPen, FaTrash } from "react-icons/fa";
import type { Blog } from "../../lib/types/blog";
import { getTagColor } from "../../lib/utils/tag-colors";

type BlogCardProps = Omit<Blog, "content" | "updatedAt" | "createdAt" | "deletedAt"> & {
    allowEditAndDelete: boolean;
    handleClick: (id: string) => void;
    handleDelete?: (e: React.MouseEvent, id: string) => void;
};

function BlogCards({ _id, title, slug, shortDescription, datePublished, author, tags, allowEditAndDelete, handleClick, handleDelete }: BlogCardProps) {
    return (
        <div>
                <div
                    onClick={() => handleClick(_id)}
                    className="group relative bg-[#171717] rounded-xl border border-gray-800 p-6 hover:border-[#4ADE80]/50 transition-all duration-300 hover:shadow-2xl hover:shadow-[#4ADE80]/10 hover:-translate-y-1 cursor-pointer flex flex-col h-full min-h-64"
                >
                    {/* Card Header: All Tags + Date */}
                    <div className="flex justify-between items-start mb-4 gap-4">
                        {/* Tags Container - Flex Wrap to handle multiple tags gracefully */}
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
                                <span 
                                    key={tag._id}
                                    className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold ${getTagColor(tag.name)}`}
                                >
                                    {tag.name}
                                </span>
                            ))}
                        </div>

                        {/* Publishing Date */}
                        <span className="text-gray-500 text-xs font-mono whitespace-nowrap pt-0.5">
                            {datePublished ? new Date(datePublished).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                            }): "Not Published"}
                        </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-white mb-3 group-hover:text-[#4ADE80] transition-colors duration-300 line-clamp-2">
                        {title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3 grow">
                        {shortDescription}
                    </p>

                    {/* Card Footer: Author + Actions */}
                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-800">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#60A5FA]/20 flex items-center justify-center border border-[#60A5FA]/30">
                                <span className="text-[10px] font-bold text-[#60A5FA]">
                                    {author.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <span className="text-xs text-gray-300">By {author.name}</span>
                        </div>

                        {allowEditAndDelete && handleDelete &&
                            <div className="flex gap-2">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleClick(_id);
                                    }}
                                    className="p-2 text-gray-500 hover:text-white hover:bg-gray-700 rounded-full transition-all duration-300"
                                    title="Edit"
                                >
                                    <FaPen className="text-xs" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(e, _id);
                                    }}
                                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all duration-300 z-10"
                                    title="Delete"
                                >
                                    <FaTrash className="text-xs" />
                                </button>
                            </div>
                        }
                    </div>
                </div>
            </div>
    )
}


export default BlogCards;