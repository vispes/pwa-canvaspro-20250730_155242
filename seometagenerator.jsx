const generateDefaultMetaTags = () => ({
  charset: 'utf-8',
  viewport: 'width=device-width, initial-scale=1',
  title: 'Project Preview Builder',
  description: 'Create and preview responsive web projects',
  'og:type': 'website',
  'og:locale': 'en_US',
  'twitter:card': 'summary_large_image'
});

const updateMetaTags = (metaData) => {
  const filteredMetaData = Object.fromEntries(
    Object.entries(metaData || {}).filter(([_, value]) => value != null)
  );
  return {
    ...generateDefaultMetaTags(),
    ...filteredMetaData
  };
};

const injectMetaTags = (metaTags) => {
  let charsetTag = document.querySelector('meta[charset]');
  if (!charsetTag) {
    charsetTag = document.createElement('meta');
    charsetTag.setAttribute('charset', '');
    document.head.prepend(charsetTag);
  }
  charsetTag.setAttribute('charset', metaTags.charset);

  let viewportTag = document.querySelector('meta[name="viewport"]');
  if (!viewportTag) {
    viewportTag = document.createElement('meta');
    viewportTag.name = 'viewport';
    document.head.appendChild(viewportTag);
  }
  viewportTag.content = metaTags.viewport;

  document.title = metaTags.title;

  const metaKeys = Object.keys(metaTags).filter(
    key => !['charset', 'viewport', 'title'].includes(key)
  );

  metaKeys.forEach(key => {
    const value = metaTags[key];
    const isOpenGraph = key.startsWith('og:');
    const selector = isOpenGraph 
      ? `meta[property="${key}"]`
      : `meta[name="${key}"]`;

    let metaElement = document.querySelector(selector);
    if (!metaElement) {
      metaElement = document.createElement('meta');
      if (isOpenGraph) {
        metaElement.setAttribute('property', key);
      } else {
        metaElement.name = key;
      }
      metaElement.setAttribute('data-dynamic-meta', 'true');
      document.head.appendChild(metaElement);
    }
    metaElement.content = value;
  });
};

const SeoMetaGenerator = ({ metaData }) => {
  useEffect(() => {
    const mergedTags = updateMetaTags(metaData);
    injectMetaTags(mergedTags);
    return () => {
      document.querySelectorAll('meta[data-dynamic-meta="true"]').forEach(el => el.remove());
    };
  }, [metaData]);

  return null;
};

export default SeoMetaGenerator;