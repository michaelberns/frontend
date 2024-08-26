import React, { useState, useEffect, memo } from 'react';
import axios from 'axios';

// PostSummary Component
const PostSummary = (props) => {
  const marker = props.marker;

  return (
    <div className={"post-summary"}>
      <a href={marker.postLink} target="blank" className="image-link">
        {marker.postImageLink !== "No image" ? (
          <img
            src={"https://images.ecency.com/256x512/" + marker.postImageLink}
            alt=""
            loading="lazy"
          />
        ) : (
          <p>No image found</p>
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
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (selectedFeatures.length > 0) {
    // const marker = selectedFeatures[0]; // Single feature case
    // return <PostSummary marker={marker} />;
    return (
      <div>
        <h4>{selectedFeatures.length} features found:</h4>
        {selectedFeatures.map((marker) => (          
          <PostSummary key={marker.postLink} marker={marker} />
        ))}
      </div>
    );
  }
});

export default InfoWindowContent;