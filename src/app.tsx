import React, { Ref, useCallback, useEffect, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios'
import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom';

import { APIProvider, InfoWindow, Map, useMap, AdvancedMarker, ControlPosition, MapControl } from '@vis.gl/react-google-maps';

import { ClusteredMarkers } from './components/clustered-markers';

import logo from './assets/worldmappin-logo.png';
import logoWithText from './assets/worldmappin-logo-text.png';
import locationpng from './assets/location.png';

import {convertDatafromApitoGeojson} from './components/convertDataFromApi'

import './style.css';
import { Feature, Point } from 'geojson';

import SlidingTab from './components/slidingtab';
import FilterComponent from './components/FilterComponent';
import SlidingUserTab from './components/userSlidingTab';
import BottomLogoClick from './components/BottomLogoClick';

import { PlacePicker} from '@googlemaps/extended-component-library/react';

import { PlacePicker as TPlacePicker } from '@googlemaps/extended-component-library/place_picker.js';

export let setGlobalLocation: (location: google.maps.places.Place | undefined) => void;
export let setGlobalZoom: (zoom: number | undefined) => void;

const API_KEY = (process.env.GOOGLE_MAPS_API_KEY as string) ?? globalThis.GOOGLE_MAPS_API_KEY;

const App = () => {
  const [geojson, setGeojson] = useState(null);
  const [numClusters, setNumClusters] = useState(0);

  type MarkerPosition = {
    lat: number;
    lng: number;
  };

  // Define the state with the correct type
  const [codeModeMarker, setCodeModeMarker] = useState<MarkerPosition | null>(null);
  const [codeMode, setCodeMode] = useState(false);

  // Toggle code mode
  const toggleCodeMode = () => {
    setCodeMode(prevMode => !prevMode);
  };
  
  const [codeModeDescription, setCodeModeDescription] = useState("");
  const [copiedToClipBoard, setCopiedToClipboard] = useState(false);

  const pickerRef = useRef<TPlacePicker>(null);
  const [location, setLocation] = useState<google.maps.places.Place | undefined>(
    undefined
  );

  setGlobalLocation = setLocation;

  //Loading State
  const [loading, setLoading] = useState(true);

  const [fetchingMarkers, setFetchingMarkers] = useState(true);

  const [performanceTest , setPerformanceTest] = useState(false);
  const [lowEndDevice , setLowEndDevice] = useState(false);

  const [showUsernameProfile, setShowUsernameProfile] = useState(false);

  let usernameProvided = false;
  var usernamep = '';

  const [showUsername, setShowUsername] = useState('');
  const [showUsersNumberOfPins, setShowUsersNumberOfPins] = useState(0);

  const [isbottomLogoClick, setIsbottomLogoClick] = useState(false);

  if (!performanceTest){
    const start = performance.now();

    for (let i = 0; i < 1e7; i++) {} // Arbitrary task for benchmarking
    const end = performance.now();
    console.log(`Time taken: ${end - start}ms`);
    if (end - start > 100) {
        console.log('This might be a low-end device based on execution time.');
        setLowEndDevice(true)
    }
    setPerformanceTest(true);
  }
  
  //Variables for api markers
  var loadedonce = false;
  const [firstLoad , setFirstLoad] = useState(false);
  
  const params = useParams();

  function YourComponent() {
    const { username } = useParams();       
    
    if (username.startsWith('@') && fetchingMarkers) {
      usernameProvided = true;
      usernamep = username.substring(1);
      useEffect(() => { 
        setShowUsername(usernamep);
        setShowUsernameProfile(true)
      });
    } else {
      usernameProvided = false;
    }
    return null
  }

  const [searchParams, setSearchParams] = useState(
    params?.username ? { author: params.username } : (params?.permlink ? { permlink: params.permlink } : (params?.tag ? { tags: [params?.tag] } : { curated_only: false }))
  );

  const [showfiltersettings, setShowfiltersettings] = useState(false);

  function getOneMonthAgo() {
    const today = new Date();
    today.setMonth(today.getMonth() - 1);
    return today.toISOString().split('T')[0]; // Returns the date in 'YYYY-MM-DD' format
  }

  const handleFilter = filterData => {
    setFetchingMarkers(true)
    const oneMonthAgo = getOneMonthAgo();

    console.log(usernameProvided)

    newSearchParams({
      tags: filterData && filterData.tags && filterData.tags.length && filterData.tags[0] ? filterData.tags : [],
      author: usernameProvided ? usernamep : filterData ? filterData.username : '',
      post_title: filterData ? filterData.postTitle : '',
      start_date: lowEndDevice ? oneMonthAgo : filterData ? filterData.startDate : '',
      end_date: filterData ? filterData.endDate : '',
      permlink: '',
      curated_only: filterData ? filterData.isCurated : false
    });
    setLowEndDevice(false) // This is to make the filter work for the user (even though they probably won't be able to fetch 100k pins)
  };
  
  //Setting the loading state to false when map tiles loaded
  const handleTilesLoaded = () => {
    setFetchingMarkers(false); // Set loading to false when tiles are loaded
  };
  
  //Handelsclick on Get Code Browser mode
  const handleClick = () => {
    setInfowindowData(undefined)
    setShowfiltersettings(false)
    toggleCodeMode();
    if(codeMode)
      setFetchingMarkers(true);
  }


  // On reload the all markers with default search search params are loaded here
  useEffect(() => {
    // void loadCastlesGeojson().then(data => setGeojson(data));
    if(!loadedonce){
      if(!firstLoad){loadmarkersonfirstLoad();}
      setFetchingMarkers(true)
      loadedonce = true;
    }
  }, [loadedonce, firstLoad]);

  async function loadmarkersonfirstLoad() {

    try {
      // const response = await axios.post('https://worldmappin.com/api/marker/0/150000/', searchParams);
      // void convertDatafromApitoGeojson(response.data).then(data => setGeojson(data));   
      handleFilter(searchParams) 
    } catch (err) {
        console.error('Error fetching feature data:', err);
    } finally {
      setFetchingMarkers(false)
      setFirstLoad(true)      
    }
  }

  const [infowindowData, setInfowindowData] = useState<{
    anchor: google.maps.marker.AdvancedMarkerElement;
    features: Feature<Point>[];
  } | null>(null);

  // const hamdleInfoWindowClose = useCallback(
  //   () => setInfowindowData(null),
  //    [setInfowindowData]
  //  );


  const bounds = {
    north: 85,  // Upper bound (near the North Pole)
    south: -85, // Lower bound (near the South Pole)
    west: -180, // Left bound (Western Hemisphere)
    east: 180,  // Right bound (Eastern Hemisphere)
  };

  async function newSearchParams(s) {
    const updatedParams = { ...searchParams, ...s };

    setSearchParams(updatedParams); // This takes a little longer so it's better to pass the updatedParams directly to the api
    setLoading(true);
    try {
      const response = await axios.post('https://worldmappin.com/api/marker/0/150000/', updatedParams);
      // console.log(updatedParams)
      // console.log(response.data)
      void convertDatafromApitoGeojson(response.data).then(data => setGeojson(data));
      if(updatedParams.author) {        
        setShowUsernameProfile(true)
        setShowUsername(updatedParams.author)
        setShowUsersNumberOfPins(response.data.length)        
      } else{
        setShowUsernameProfile(false)
      }
    } catch (err) {
        console.error('Error fetching feature data:', err);
    } finally {
      setFetchingMarkers(false)
    }
  }

  //const map = useMap();
  const mapRef = useRef(null);
  const [mylocationzoom, setMyLocationZoom] = useState<number | undefined>(undefined);
  setGlobalZoom = setMyLocationZoom;
  const [displaymylocation, setDisplaymylocation] = useState(false);

  const [poss, setPoss] = useState({ lat: null, lng: null });

  function handlePosition(pos) {
    // Update the state with the new position
    setPoss({
      lat: pos.lat,
      lng: pos.lng,
    });
    
    console.log("Position set to:", poss);
  }

  const handleClickBottomLogo = () => {
    setIsbottomLogoClick(true)
  }

  // Select the image element
  //const img = document.querySelector('.logo-with-text img');

  // Function to add the wiggle class, triggering the animation
  function triggerWiggle() {
    const contentElement = document.querySelector('.logo-with-text img') as HTMLDivElement; 
    if (contentElement) {
        contentElement.classList.add('wiggle');
    }

    setTimeout(() => {
      contentElement.classList.remove('wiggle');
    }, 5000); // Match the duration of the wiggle animation (0.5s)
  } 

  // Trigger the wiggle function every second
  setInterval(triggerWiggle, 10000);
  //console.log(window.innerWidth)
  const handleCloseBottomLogoClick = () => {
    setIsbottomLogoClick(false);
  };

  function handleteaminfofetch() {
    setFetchingMarkers(true)
  };

  function handleteaminfofetchdone() {
    setFetchingMarkers(false)
  }

  return (
    <APIProvider apiKey={API_KEY} version={'beta'}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={null}>
            <Route path="p/:permlink" element={null} />
            <Route path="t/:tag" element={null} />
            <Route path="*" element={null} /> {/*TODO Add PAGE NOT FOUND*/}
            </Route>
            <Route path="/:username" element={<YourComponent />} />
          </Routes>
        </BrowserRouter>

      <div className="LocationPickerContainer">
        <PlacePicker
          className="LocationPicker"
          ref={pickerRef}
          forMap="gmap"

          placeholder="Search for a place"
          onPlaceChange={() => {
            if (!pickerRef.current?.value) {
              setLocation(undefined);
            } else {
              setLocation(pickerRef.current?.value);
              setMyLocationZoom(9);
            }
          }}
        />
      </div>

      <div className="logo-with-text">
        <img onClick={handleClickBottomLogo} src={logoWithText} alt="" />
      </div>

      <div className="button-container">
        {/* Button to toggle between code mode and browse mode */}
        <p onClick={handleClick} style={{ cursor: "pointer" }}>
            {codeMode ? "Browse Map" : "Get Code"}
        </p>
        <p
        id="get-loaction-button"
        onClick={() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const pos = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                };

                //poss = {lat: pos.lat, lng: pos.lng};
                handlePosition(pos)                
      
                // Update the user location in state
                setLocation({ location: pos });
                setDisplaymylocation(true)
                setMyLocationZoom(16)
              },
              () => {
                console.log("Couldn't access your location");
              }
            );
          } else {
            // Browser doesn't support Geolocation
            console.log("Browser doesn't support Geolocation");
          }
        }}
        >
          my location
        </p>
        {!codeMode && <p onClick={() => {setShowfiltersettings(true); setInfowindowData(undefined)}}>filter the map</p>}
        </div>
        <div className="filter-container">

        {showfiltersettings && <FilterComponent onFilter={handleFilter} searchParams={searchParams}/>}

        {showfiltersettings &&  <div className='filter-close'>
            <div className="close-btn"><p onClick={() => setShowfiltersettings(false)}>X</p>
          </div>
          </div>}

      </div>

      {/* TODO FIX LOADING LOGIC */}
      {fetchingMarkers && <div className="loader-container">
          <div className="loader">
          <img src={logo} alt="" />
          </div>
          <p>Getting pins...</p>
        </div>}

           
        <Map
          onTilesLoaded={handleTilesLoaded}          
          mapId={'edce5dcfb5575af1'}
          defaultCenter={{ lat: 20, lng: 20 }}
          defaultZoom={1}
          minZoom={1}
          maxZoom={15}
          zoomControl={true}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
        
          // mapTypeControl={true}
          // mapTypeControlOptions={{
          //   position: window.google?.maps.ControlPosition.RIGHT_TOP,
          //   style: window.google?.maps.MapTypeControlStyle.DROPDOWN_MENU
          // }}

          fullscreenControl={false}

          streetViewControl={true}
          className={'custom-marker-clustering-map'}
          restriction={{
            latLngBounds: bounds,
            strictBounds: true,  // Enforces the restriction strictly
          }}

          center={location?.location}
          zoom={
            location?.location ? mylocationzoom : undefined //: undefined
          }          
          onIdle={() => {setLocation(undefined); setMyLocationZoom(undefined)}}
          
          onClick={(e) => {
            if(codeMode){
              const latLng = e.detail?.latLng;

              const { lat, lng } = latLng;//Deconstruct latLng

              // Set the marker and reset clipboard state
              setCodeModeMarker({ lat, lng });
              setCopiedToClipboard(false);
            }            
          }}
        >
          {!codeMode && geojson && !fetchingMarkers && (
            <ClusteredMarkers
              geojson={geojson}
              setNumClusters={setNumClusters}
              setInfowindowData={setInfowindowData}
            />
          )}          

          {codeMode &&
              <div className="code-mode-div">
              <input
                type="text"
                placeholder="Short description here"
                maxLength={250}
                onChange={(t) => {
                  setCodeModeDescription(t.target.value);
                }}
              />
              <p className="info-text">
                {codeModeMarker
                  ? copiedToClipBoard
                    ? "Copied successfully!"
                    : "Click the code to copy, then add it to your post on Hive."
                  : "Click on the map on the location of your post for the code to be generated."}
              </p>
              {codeModeMarker ? (
                <p
                  className="code-to-copy"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      "[//]:# (!worldmappin " +
                      codeModeMarker.lat.toFixed(5) +
                      " lat " +
                      codeModeMarker.lng.toFixed(5) +
                      " long " +
                      codeModeDescription +
                      " d3scr)"
                    );
                    setCopiedToClipboard(true);
                  }}
                >
                  {"[//]:# (!worldmappin " +
                    codeModeMarker.lat.toFixed(5) +
                    " lat " +
                    codeModeMarker.lng.toFixed(5) +
                    " long " +
                    codeModeDescription +
                    " d3scr)"}
                </p>
              ) : (
                <></>
              )}

            </div>           
          }

          {displaymylocation &&
            <AdvancedMarker 
            position={{ lat: poss.lat, lng: poss.lng }}            
            options = {{ scale: 0.3 }}
          ><img src={locationpng} width={32} height={32} /></AdvancedMarker>
          }
          

          {codeMode && codeModeMarker && (
            <AdvancedMarker position={{ lat: codeModeMarker.lat, lng: codeModeMarker.lng }} />
          )}
      
          {infowindowData && (
            <SlidingTab infowindowData={infowindowData.features} />
          )}

          {isbottomLogoClick && (
            <BottomLogoClick onClose={handleCloseBottomLogoClick} onfetch={handleteaminfofetch} fetchdone={handleteaminfofetchdone}/>
          )}

          {/* Display the user slidingbar */}
          {showUsernameProfile && (
            <SlidingUserTab userInfowindowData={geojson} username={showUsername} pinCount={showUsersNumberOfPins}/>
          )}

        </Map>
      
      
    </APIProvider>
  );
};


export default App;

export function renderToDom(container: HTMLElement) {
  const root = createRoot(container);

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}