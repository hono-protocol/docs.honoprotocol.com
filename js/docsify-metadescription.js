(function () {
    async function fetchMarkdownContent(url) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          console.warn(`Failed to fetch markdown content from ${url}:`, response.statusText);
          return null;
        }
        return await response.text();
      } catch (error) {
        console.error('Error fetching markdown content:', error);
        return null;
      }
    }
  
    function extractFirstSentence(markdownContent) {
      // Remove titles, headings, and code blocks
      const cleanedContent = markdownContent
        .replace(/^#.*$/gm, '') // Remove titles and headings
        .replace(/```[\s\S]*?```/g, '') // Remove code blocks
        .replace(/\[.*?\]\(.*?\)/g, '') // Remove markdown links
        .replace(/\*\*|\*/g, '') // Remove markdown bold/italic
        .trim();
  
      // Extract the first sentence
      const match = cleanedContent.match(/[^.!?]*[.!?]/);
      return match ? match[0].trim() : '';
    }
  
    async function setMetaDescription() {
      console.log('Setting meta description tags'); // Debugging log
  
      // Remove existing meta description tags
      const metaTags = [
        'meta[name="description"]',
        'meta[property="og:description"]',
        'meta[property="twitter:description"]'
      ];
      metaTags.forEach(selector => {
        const existingMeta = document.querySelector(selector);
        if (existingMeta) {
          existingMeta.remove();
        }
      });
  
      // Get the current Docsify page path
      const page = document.body.getAttribute('data-page');
      if (!page) {
        console.warn('No data-page attribute found on body. Cannot set meta descriptions.');
        return;
      }
  
      // Construct the markdown file URL
      const { protocol, host } = window.location;
      const markdownURL = `${protocol}//${host}/${page}`;
  
      // Fetch the markdown content and extract the first sentence
      const markdownContent = await fetchMarkdownContent(markdownURL);
      if (!markdownContent) return;
  
      const firstSentence = extractFirstSentence(markdownContent);
      if (!firstSentence) {
        console.warn('No valid content found for meta description.');
        return;
      }
  
      // Create and append meta tags
      const descriptions = [
        { name: 'description', content: firstSentence },
        { property: 'og:description', content: firstSentence },
        { property: 'twitter:description', content: firstSentence }
      ];
  
      descriptions.forEach(({ name, property, content }) => {
        const meta = document.createElement('meta');
        if (name) {
          meta.setAttribute('name', name);
        }
        if (property) {
          meta.setAttribute('property', property);
        }
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      });
  
      console.log('Meta description set to:', firstSentence); // Debugging log
    }
  
    function metaDescriptionPlugin(hook) {
      console.log('Docsify plugin for meta description is registered'); // Debugging log
  
      hook.ready(() => {
        console.log('Docsify ready hook triggered'); // Debugging log
        setMetaDescription(); // For the initial load
      });
  
      hook.doneEach(() => {
        console.log('Docsify doneEach hook triggered'); // Debugging log
        setMetaDescription(); // For subsequent navigation
      });
    }
  
    // Register the plugin with Docsify
    window.$docsify = window.$docsify || {};
    window.$docsify.plugins = (window.$docsify.plugins || []).concat(metaDescriptionPlugin);
  })();