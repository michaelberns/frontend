import React, { useRef, useState } from 'react';
import FilterComponent from './FilterComponent';
import { PlacePicker } from '@googlemaps/extended-component-library/react';
import { PlacePicker as TPlacePicker } from '@googlemaps/extended-component-library/place_picker.js';
import LogoPng from '../assets/worldmappin_claim_logo.png';
import './navbar.css';

import { isMenuOpen } from '../app'

function calculateZoomLevel(bounds, types) {
  const GLOBE_WIDTH = 256;
  let angle = bounds.ne.lng - bounds.sw.lng;

  if(types.includes("establishment")){
    const zoomMax = 20;
    return zoomMax;
  }

  if (angle < 0) {
      angle += 360;
  }
  const zoomMax = Math.round(Math.log(960 * 360 / angle / GLOBE_WIDTH) / Math.LN2);
  return zoomMax;
}

const Navbar = ({
    codeMode,
    onToggleCodeMode,
    onGetLocation,
    showFilterSettings,
    handleFilter,
    searchParams,
    setShowfiltersettings,
    setLocation,
    setMyLocationZoom,
    numOfPins,
    toggleMenuApp,
    isMobile
}) => {
  // Declare pickerRef using useRef
  const pickerRef = useRef<TPlacePicker | null>(null);

  const [isMenuOpen2, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen2);
    toggleMenuApp();
  };

  if(!isMenuOpen && isMenuOpen2) {
    toggleMenu();
    toggleMenuApp();
  }

  return (
    
    <div className="CS-container">
      {!isMenuOpen2 && (
      <div className="navbar-container">
      <div className="nav-links">

        

        <div className="LocationPickerContainer">
            <div className="search-bar-wrapper">
                <a href="/">
                  <div className="logo-png" >
                      <img src={LogoPng} alt="" width={150} style={{ height: 'auto' }} />
                  </div>
                </a>
            </div>

            <div className="search-bar-wrapper2">
                <PlacePicker
                    className="LocationPicker"
                    ref={pickerRef}
                    forMap="gmap"
                    placeholder={`Search for a place | You are looking at ${numOfPins} Pins`}
                    onPlaceChange={() => {
                    if (!pickerRef.current?.value) {
                        setLocation(undefined);
                    } else {
                        setLocation(pickerRef.current?.value);                        
                        console.log(pickerRef.current?.value.viewport); // Here we get the bounds
                        let types = pickerRef.current?.value.types;

                        let viewport = pickerRef.current?.value.viewport;

                        // Translating your received object into the expected format:
                        let bounds = {
                            ne: { lat: viewport.Jh.hi, lng: viewport.ji.hi },
                            sw: { lat: viewport.Jh.lo, lng: viewport.ji.lo }
                        };

                        const zoomLevel = calculateZoomLevel(bounds, types);    
                        console.log(zoomLevel);             
                        setMyLocationZoom(zoomLevel); // zoom level should be dynamically set depending on the bounds
                    }
                  }}
                />

                <div className="button-container">
                    <p onClick={onToggleCodeMode} style={{ cursor: "pointer" }}>
                        {codeMode ? "Browse Map" : "Get Code"}
                    </p>
                    <p id="get-location-button" onClick={onGetLocation}>
                    My Location
                    </p>
                    {!codeMode && <p onClick={() => { setShowfiltersettings(true)}}>Filter Map</p>}
                </div>
            </div>
        </div>
                  
        

        {/* Filter container UI logic */}

        <div className="filter-container">
          {showFilterSettings && <FilterComponent onFilter={handleFilter} searchParams={searchParams} />}
          {showFilterSettings && <div className='filter-close'>
            <div className="close-btn"><p onClick={() => setShowfiltersettings(false)}>X</p>
            </div>
          </div>}

        </div>
      </div>
      </div>
      )}

      {/*Mobile Menu*/}
      <div className={`burger-menu ${isMenuOpen2 ? 'open' : ''}`}
        onClick={() => {  toggleMenu(); }}
      >
        <div>
          <span></span>
          <span></span>
          <span></span>
        </div>
        </div> 
      <div className="circle-container-2">
      <div className="circle-2">
      <div className="circle4">   
        </div>
        </div>
      </div>

      {(isMenuOpen2 && isMenuOpen) && (
        <div className="navbar-container2">
        <div className="mobile-menu">

          <div className="LocationPickerContainer2">
              <PlacePicker
                className="LocationPicker2"
                ref={pickerRef}
                forMap="gmap"
                placeholder={`Search place | Viewing: ${numOfPins} Pins`}
                onPlaceChange={() => {
                if (!pickerRef.current?.value) {
                    setLocation(undefined);
                } else {
                    setLocation(pickerRef.current?.value);                        
                    console.log(pickerRef.current?.value.viewport); // Here we get the bounds
                    let types = pickerRef.current?.value.types;

                    let viewport = pickerRef.current?.value.viewport;

                    // Translating your received object into the expected format:
                    let bounds = {
                        ne: { lat: viewport.Jh.hi, lng: viewport.ji.hi },
                        sw: { lat: viewport.Jh.lo, lng: viewport.ji.lo }
                    };

                    const zoomLevel = calculateZoomLevel(bounds, types);    
                    console.log(zoomLevel);             
                    setMyLocationZoom(zoomLevel); // zoom level should be dynamically set depending on the bounds
                }
              }}
            />
          

            <div className="button-container2">
              <p onClick={() => {  onToggleCodeMode();}} style={{ cursor: "pointer" }}>
                {codeMode ? "Browse Map" : "Get Code"}
              </p>
              <p id="get-location-button" onClick={onGetLocation}>
                My Location
              </p>
              {!codeMode && <p onClick={() => { setShowfiltersettings(true); }}>filter the map</p>}
            </div>
          </div>

          {/* Filter container UI logic */}


          <div className="filter-container">

            {showFilterSettings && <FilterComponent onFilter={handleFilter} searchParams={searchParams} />}

            {showFilterSettings && <div className='filter-close'>
              <div className="close-btn"><p onClick={() => setShowfiltersettings(false)}>X</p>
              </div>
            </div>}

          </div>


        </div></div>
      )}
    </div>
  );
};

export default Navbar;
