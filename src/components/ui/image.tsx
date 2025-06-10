import React from 'react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

const Image: React.FC<ImageProps> = ({ src, alt, className, fallback, ...props }) => {
  const [error, setError] = React.useState(false);

  const handleError = () => {
    setError(true);
  };

  if (error || !src) {
    return <div className={className} style={{ backgroundColor: 'transparent' }} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
};

export default Image; 