'use client';

import {
    Bold, Italic, Underline, Strikethrough,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    List, ListOrdered, Quote, Code, Minus,
    Undo, Redo, Heading1, Heading2, Heading3,
    Table, TableProperties, Columns, Rows, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Editor } from '@tiptap/react';

interface EditorToolbarProps {
    editor: Editor;
}

/**
 * EditorToolbar component - A rich text editor toolbar for TipTap
 *
 * Provides formatting controls for:
 * - Undo/Redo
 * - Headings (H1, H2, H3)
 * - Text formatting (Bold, Italic, Underline, Strikethrough)
 * - Text alignment (Left, Center, Right, Justify)
 * - Lists (Bullet, Ordered)
 * - Tables (Insert, Add/Delete rows/columns)
 * - Block elements (Blockquote, Code Block, Horizontal Rule)
 */
export function EditorToolbar({ editor }: EditorToolbarProps) {
    return (
        <div className="border-b border-[#2A2A2A] bg-[#151515] p-3">
            <div className="max-w-4xl mx-auto flex items-center gap-1 flex-wrap">
                {/* Undo/Redo */}
                <Button
                    type="button"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    className="p-2 h-9 w-9 bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Undo"
                >
                    <Undo className="h-4 w-4" />
                </Button>

                <Button
                    type="button"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    className="p-2 h-9 w-9 bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Redo"
                >
                    <Redo className="h-4 w-4" />
                </Button>

                <div className="w-px h-6 bg-[#3A3A3A] mx-1" />

                {/* Headings */}
                <Button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`p-2 h-9 w-9 ${
                        editor.isActive('heading', { level: 1 })
                            ? 'bg-[#3A3A3A] text-white'
                            : 'bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white'
                    }`}
                    title="Heading 1"
                >
                    <Heading1 className="h-4 w-4" />
                </Button>

                <Button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`p-2 h-9 w-9 ${
                        editor.isActive('heading', { level: 2 })
                            ? 'bg-[#3A3A3A] text-white'
                            : 'bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white'
                    }`}
                    title="Heading 2"
                >
                    <Heading2 className="h-4 w-4" />
                </Button>

                <Button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={`p-2 h-9 w-9 ${
                        editor.isActive('heading', { level: 3 })
                            ? 'bg-[#3A3A3A] text-white'
                            : 'bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white'
                    }`}
                    title="Heading 3"
                >
                    <Heading3 className="h-4 w-4" />
                </Button>

                <div className="w-px h-6 bg-[#3A3A3A] mx-1" />

                {/* Bold */}
                <Button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-2 h-9 w-9 ${
                        editor.isActive('bold')
                            ? 'bg-[#3A3A3A] text-white'
                            : 'bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white'
                    }`}
                    title="Bold"
                >
                    <Bold className="h-4 w-4" />
                </Button>

                {/* Italic */}
                <Button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-2 h-9 w-9 ${
                        editor.isActive('italic')
                            ? 'bg-[#3A3A3A] text-white'
                            : 'bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white'
                    }`}
                    title="Italic"
                >
                    <Italic className="h-4 w-4" />
                </Button>

                {/* Underline */}
                <Button
                    type="button"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`p-2 h-9 w-9 ${
                        editor.isActive('underline')
                            ? 'bg-[#3A3A3A] text-white'
                            : 'bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white'
                    }`}
                    title="Underline"
                >
                    <Underline className="h-4 w-4" />
                </Button>

                {/* Strikethrough */}
                <Button
                    type="button"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`p-2 h-9 w-9 ${
                        editor.isActive('strike')
                            ? 'bg-[#3A3A3A] text-white'
                            : 'bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white'
                    }`}
                    title="Strikethrough"
                >
                    <Strikethrough className="h-4 w-4" />
                </Button>

                <div className="w-px h-6 bg-[#3A3A3A] mx-1" />

                {/* Align Left */}
                <Button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={`p-2 h-9 w-9 ${
                        editor.isActive({ textAlign: 'left' })
                            ? 'bg-[#3A3A3A] text-white'
                            : 'bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white'
                    }`}
                    title="Align Left"
                >
                    <AlignLeft className="h-4 w-4" />
                </Button>

                {/* Align Center */}
                <Button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={`p-2 h-9 w-9 ${
                        editor.isActive({ textAlign: 'center' })
                            ? 'bg-[#3A3A3A] text-white'
                            : 'bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white'
                    }`}
                    title="Align Center"
                >
                    <AlignCenter className="h-4 w-4" />
                </Button>

                {/* Align Right */}
                <Button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className={`p-2 h-9 w-9 ${
                        editor.isActive({ textAlign: 'right' })
                            ? 'bg-[#3A3A3A] text-white'
                            : 'bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white'
                    }`}
                    title="Align Right"
                >
                    <AlignRight className="h-4 w-4" />
                </Button>

                {/* Align Justify */}
                <Button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                    className={`p-2 h-9 w-9 ${
                        editor.isActive({ textAlign: 'justify' })
                            ? 'bg-[#3A3A3A] text-white'
                            : 'bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white'
                    }`}
                    title="Justify"
                >
                    <AlignJustify className="h-4 w-4" />
                </Button>

                <div className="w-px h-6 bg-[#3A3A3A] mx-1" />

                {/* Bullet List */}
                <Button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-2 h-9 w-9 ${
                        editor.isActive('bulletList')
                            ? 'bg-[#3A3A3A] text-white'
                            : 'bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white'
                    }`}
                    title="Bullet List"
                >
                    <List className="h-4 w-4" />
                </Button>

                {/* Ordered List */}
                <Button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-2 h-9 w-9 ${
                        editor.isActive('orderedList')
                            ? 'bg-[#3A3A3A] text-white'
                            : 'bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white'
                    }`}
                    title="Ordered List"
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>

                <div className="w-px h-6 bg-[#3A3A3A] mx-1" />

                {/* Table Controls */}
                <Button
                    type="button"
                    onClick={() => {
                        const rows = prompt('Enter number of rows:', '3');
                        const cols = prompt('Enter number of columns:', '3');
                        if (rows && cols) {
                            const numRows = parseInt(rows, 10);
                            const numCols = parseInt(cols, 10);
                            if (numRows > 0 && numCols > 0) {
                                editor.chain().focus().insertTable({
                                    rows: numRows,
                                    cols: numCols,
                                    withHeaderRow: true
                                }).run();
                            }
                        }
                    }}
                    className={`p-2 h-9 w-9 ${
                        editor.isActive('table')
                            ? 'bg-[#3A3A3A] text-white'
                            : 'bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white'
                    }`}
                    title="Insert Table"
                >
                    <Table className="h-4 w-4" />
                </Button>

                {editor.isActive('table') && (
                    <>
                        <Button
                            type="button"
                            onClick={() => editor.chain().focus().addColumnBefore().run()}
                            className="p-2 h-9 w-9 bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white"
                            title="Add Column Before"
                        >
                            <Columns className="h-4 w-4" />
                        </Button>

                        <Button
                            type="button"
                            onClick={() => editor.chain().focus().addColumnAfter().run()}
                            className="p-2 h-9 w-9 bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white"
                            title="Add Column After"
                        >
                            <Columns className="h-4 w-4 rotate-180" />
                        </Button>

                        <Button
                            type="button"
                            onClick={() => editor.chain().focus().addRowBefore().run()}
                            className="p-2 h-9 w-9 bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white"
                            title="Add Row Before"
                        >
                            <Rows className="h-4 w-4" />
                        </Button>

                        <Button
                            type="button"
                            onClick={() => editor.chain().focus().addRowAfter().run()}
                            className="p-2 h-9 w-9 bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white"
                            title="Add Row After"
                        >
                            <Rows className="h-4 w-4 rotate-180" />
                        </Button>

                        <Button
                            type="button"
                            onClick={() => editor.chain().focus().deleteColumn().run()}
                            className="p-2 h-9 w-9 bg-red-900/20 text-red-400 hover:bg-red-900/40 hover:text-red-300"
                            title="Delete Column"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>

                        <Button
                            type="button"
                            onClick={() => editor.chain().focus().deleteRow().run()}
                            className="p-2 h-9 w-9 bg-red-900/20 text-red-400 hover:bg-red-900/40 hover:text-red-300"
                            title="Delete Row"
                        >
                            <Minus className="h-4 w-4" />
                        </Button>

                        <Button
                            type="button"
                            onClick={() => editor.chain().focus().deleteTable().run()}
                            className="p-2 h-9 w-9 bg-red-900/30 text-red-400 hover:bg-red-900/50 hover:text-red-300"
                            title="Delete Table"
                        >
                            <TableProperties className="h-4 w-4" />
                        </Button>
                    </>
                )}

                <div className="w-px h-6 bg-[#3A3A3A] mx-1" />

                {/* Blockquote */}
                <Button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={`p-2 h-9 w-9 ${
                        editor.isActive('blockquote')
                            ? 'bg-[#3A3A3A] text-white'
                            : 'bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white'
                    }`}
                    title="Blockquote"
                >
                    <Quote className="h-4 w-4" />
                </Button>

                {/* Code Block */}
                <Button
                    type="button"
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    className={`p-2 h-9 w-9 ${
                        editor.isActive('codeBlock')
                            ? 'bg-[#3A3A3A] text-white'
                            : 'bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white'
                    }`}
                    title="Code Block"
                >
                    <Code className="h-4 w-4" />
                </Button>

                {/* Horizontal Rule */}
                <Button
                    type="button"
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    className="p-2 h-9 w-9 bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A] hover:text-white"
                    title="Horizontal Line"
                >
                    <Minus className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
