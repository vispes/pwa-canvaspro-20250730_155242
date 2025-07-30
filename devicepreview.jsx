const DevicePreview = forwardRef(({ children }, ref) => {
  const [deviceType, setDeviceType] = useState('desktop');
  const [orientation, setOrientation] = useState('landscape');

  const deviceDimensions = {
    desktop: { width: '100%', height: '100%' },
    mobile: {
      portrait: { width: 375, height: 667 },
      landscape: { width: 667, height: 375 }
    },
    tablet: {
      portrait: { width: 768, height: 1024 },
      landscape: { width: 1024, height: 768 }
    }
  };

  const handleOrientation = useCallback((mode) => {
    setOrientation(prev => {
      if (mode === 'toggle') return prev === 'portrait' ? 'landscape' : 'portrait';
      return ['portrait', 'landscape'].includes(mode) ? mode : prev;
    });
  }, []);

  const getDimensions = () => {
    if (deviceType === 'desktop') return { width: '100%', height: '100%' };
    const base = deviceDimensions[deviceType];
    return orientation === 'portrait' ? base.portrait : base.landscape;
  };

  useImperativeHandle(ref, () => ({
    setDeviceType: (type) => setDeviceType(['mobile', 'tablet', 'desktop'].includes(type) ? type : 'desktop'),
    getCurrentDevice: () => deviceType,
    previewOrientation: handleOrientation
  }));

  const { width, height } = getDimensions();

  return (
    <div 
      className="device-preview-container"
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        transformOrigin: 'top center',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        backgroundColor: '#ffffff',
        border: '12px solid #1a1a1a',
        borderRadius: '32px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        overflow: 'hidden',
        margin: '20px auto',
        position: 'relative'
      }}
    >
      <div className="device-content">
        {children}
      </div>
    </div>
  );
});

export default DevicePreview;