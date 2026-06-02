import { defineConfig } from 'astro/config';

// Normalize image paths coming from Obsidian / the old Hugo setup to absolute
// public URLs so they resolve from any page.
//   attachments/x.png
//   ./attachments/x.png
//   public/attachments/x.png   (what Obsidian "absolute" links produce)
// all become:  /attachments/x.png   (served from public/attachments/)
function remarkAttachments() {
  return (tree) => {
    const walk = (node) => {
      if (node.type === 'image' && typeof node.url === 'string') {
        node.url = node.url.replace(/^(\.\/)?(public\/)?attachments\//, '/attachments/');
      }
      if (Array.isArray(node.children)) node.children.forEach(walk);
    };
    walk(tree);
  };
}

// https://astro.build
export default defineConfig({
  site: 'https://krymancer.dev',
  markdown: {
    remarkPlugins: [remarkAttachments],
  },
});
