(function () {
  function setCanonicalMeta() {
    console.log('Setting canonical meta tag'); // Debugging log

    // Remove existing canonical tag
    let existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // Remove existing og:url meta tag
    let existingOgUrlMeta = document.querySelector('meta[property="og:url"]');
    if (existingOgUrlMeta) {
      existingOgUrlMeta.remove();
    }

    // Get the current Docsify page path from the `data-page` attribute
    const page = document.body.getAttribute('data-page');
    if (!page) {
      console.warn('No data-page attribute found on body. Cannot set canonical or og:url.');
      return;
    }

    // Remove the ".md" extension and "README" if it's at the end of the path
    let cleanedPath = page.replace(/\.md$/, ''); // Remove the ".md" extension
    cleanedPath = cleanedPath.replace(/README$/, ''); // Remove "README" at the end of the path

    const { protocol, host } = window.location;
    const canonicalURL = `${protocol}//${host}/#/${cleanedPath}`;

    // Create and append the canonical tag
    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = canonicalURL;
    document.head.appendChild(canonical);

    // Create and append the og:url meta tag
    const ogUrlMeta = document.createElement('meta');
    ogUrlMeta.setAttribute('property', 'og:url');
    ogUrlMeta.setAttribute('content', canonicalURL);
    document.head.appendChild(ogUrlMeta);

    console.log('Canonical URL set to:', canonicalURL); // Debugging log
    console.log('og:url meta tag set to:', canonicalURL); // Debugging log
  }

  function canonicalPlugin(hook) {
    console.log('Docsify plugin is registered'); // Debugging log

    hook.ready(() => {
      console.log('Docsify ready hook triggered'); // Debugging log
      setCanonicalMeta(); // For the initial load
    });

    hook.doneEach(() => {
      console.log('Docsify doneEach hook triggered'); // Debugging log
      setCanonicalMeta(); // For subsequent navigation
    });
  }

  // Register the plugin with Docsify
  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(canonicalPlugin);
})();
