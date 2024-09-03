import React, { useState, useEffect, memo } from 'react';
import axios from 'axios';
import img_logo from '../assets/no-image-found.png';

// PostSummary Component
const PostSummary = (props) => {
  const marker = props.marker;
  const [isImageError, setIsImageError] = useState(false);

  const handleImageError = () => {
    setIsImageError(true);
  };

  return (
    <div className={"post-summary"}>
      <a href={marker.postLink} target="blank" className="image-link">
        {!isImageError && marker.postImageLink !== "No image" ? (
          <img
            src={"https://images.ecency.com/256x512/" + marker.postImageLink}
            alt=""
            loading="lazy"
            onError={handleImageError}
          />
        ) : (
          <img
            src={img_logo}
            alt="Default Logo"
            loading="lazy"
          />
        )}
      </a>
      <div className="post-info">
        <h2 className="title">
          <a href={marker.postLink} target="blank">
            {marker.postTitle}
          </a>
        </h2>
        <div className="description">
          <p>{marker.postDescription}</p>
        </div>
        <div className="extra-info">
          <p>{"@" + marker.username}</p>
          <p>{(new Date(marker.postDate)).toDateString()}</p>
        </div>
      </div>
    </div>
  );
};

// Main InfoWindowContent Component
export const InfoWindowContent = memo(({ features }) => {
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetching posts by feature ids
  const fetchFeatures = async () => {
    const featureIds = features.map((feature) => feature.id);
    if (featureIds.length > 0) {
      try {
        setLoading(true);
        const response = await axios.post("https://worldmappin.com/api/marker/ids", {
          marker_ids: featureIds,
        });
        setSelectedFeatures(response.data); // Assume response.data is an array of markers
        // console.log(response.data)
      } catch (err) {
        setError(err.message);
        console.error('Error fetching feature data:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, [features]);  

  if (loading) {
    if(!features.length ) {
      setLoading(false);
      return
    }
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (selectedFeatures.length > 0) {  
    // Sort selectedFeatures by postDate in descending order (latest date first)
    const sortedFeatures = selectedFeatures.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
    return (
      <div>
        <h4>Pins Loaded: {selectedFeatures.length}</h4>
        {sortedFeatures.map((marker) => (
          <PostSummary key={marker.postLink} marker={marker} />
        ))}
      </div>
    );
  }
});

export default InfoWindowContent;