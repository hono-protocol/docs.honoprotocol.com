(function () {
    function setMetaTitle() {
      console.log('Setting meta title tags'); // Debugging log
  
      // Remove existing og:title meta tag
      let existingOgTitleMeta = document.querySelector('meta[property="og:title"]');
      if (existingOgTitleMeta) {
        existingOgTitleMeta.remove();
      }
  
      // Remove existing twitter:title meta tag
      let existingTwitterTitleMeta = document.querySelector('meta[property="twitter:title"]');
      if (existingTwitterTitleMeta) {
        existingTwitterTitleMeta.remove();
      }
  
      // Get the title of the current page from the document
      const title = document.title;
      if (!title) {
        console.warn('No title found on the document. Cannot set og:title or twitter:title.');
        return;
      }
  
      // Create and append the og:title meta tag
      const ogTitleMeta = document.createElement('meta');
      ogTitleMeta.setAttribute('property', 'og:title');
      ogTitleMeta.setAttribute('content', title);
      document.head.appendChild(ogTitleMeta);
  
      // Create and append the twitter:title meta tag
      const twitterTitleMeta = document.createElement('meta');
      twitterTitleMeta.setAttribute('property', 'twitter:title');
      twitterTitleMeta.setAttribute('content', title);
      document.head.appendChild(twitterTitleMeta);
  
      console.log('og:title meta tag set to:', title); // Debugging log
      console.log('twitter:title meta tag set to:', title); // Debugging log
    }
  
    function metaTitlePlugin(hook) {
      console.log('Docsify plugin for meta title is registered'); // Debugging log
  
      hook.ready(() => {
        console.log('Docsify ready hook triggered'); // Debugging log
        setMetaTitle(); // For the initial load
      });
  
      hook.doneEach(() => {
        console.log('Docsify doneEach hook triggered'); // Debugging log
        setMetaTitle(); // For subsequent navigation
      });
    }
  
    // Register the plugin with Docsify
    window.$docsify = window.$docsify || {};
    window.$docsify.plugins = (window.$docsify.plugins || []).concat(metaTitlePlugin);
  })();
  