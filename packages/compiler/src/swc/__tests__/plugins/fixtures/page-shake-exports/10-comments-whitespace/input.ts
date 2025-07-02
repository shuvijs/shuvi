// This is a comment
/* This is a block comment */

// Loader export with comments
export const loader = async ctx => {
  // Inline comment
  console.log('loader function')
  /* Block comment inside function */
}

// Function with comments
export function commentedFunction() {
  // Function comment
  return 'commented function'
}

// Variable with comments
export const commentedVar = 'commented var' // Inline comment

// Default export with comments
export default function CommentedPage() {
  /* Block comment */
  return 'commented page' // Inline comment
} 