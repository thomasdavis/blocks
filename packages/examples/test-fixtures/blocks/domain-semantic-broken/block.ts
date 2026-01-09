// This block intentionally violates domain rules:
// 1. Uses generic <div> elements instead of semantic HTML tags
// 2. Uses inline style attributes

export function renderContent(content: string): { html: string } {
  // VIOLATION 1: Using div instead of semantic HTML tags (header, main, article, etc.)
  // VIOLATION 2: Using inline styles
  return {
    html: `
      <div class="wrapper" style="padding: 20px; margin: 10px;">
        <div class="header" style="background: blue; color: white;">
          <div class="title">Content Title</div>
        </div>
        <div class="content" style="font-size: 16px;">
          ${content}
        </div>
        <div class="footer" style="border-top: 1px solid #ccc;">
          <span>Footer content</span>
        </div>
      </div>
    `,
  };
}
