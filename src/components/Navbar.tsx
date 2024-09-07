import React, { useRef, useState } from 'react';
import FilterComponent from './FilterComponent';
import { PlacePicker } from '@googlemaps/extended-component-library/react';
import { PlacePicker as TPlacePicker } from '@googlemaps/extended-component-library/place_picker.js';
import LogoPng from '../assets/worldmappin_claim_logo.png';
import './navbar.css';

import { isMenuOpen } from '../app'

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
    // if(!isMobile){toggleMenuApp();} // Potentially a buf
    toggleMenuApp();
  };

  if(!isMenuOpen && isMenuOpen2) {
    toggleMenu();
    // if(!isMobile){toggleMenuApp();}
    toggleMenuApp();
  }

  return (
    
    <div className="CS-container">
      {!isMenuOpen2 && (
      <div className="navbar-container">
      <div className="nav-links">

        

        <div className="LocationPickerContainer">
            <div className="search-bar-wrapper">
                <div className="logo-png" >
                    <img src={LogoPng} alt="" width={150} style={{ height: 'auto' }} />
                </div>
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
                        setMyLocationZoom(9);
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
                  setMyLocationZoom(9);
                }
              }}
            />
          </div>

          <div className="button-container2">
            <p onClick={() => {  onToggleCodeMode();}} style={{ cursor: "pointer" }}>
              {codeMode ? "Browse Map" : "Get Code"}
            </p>
            <p id="get-location-button" onClick={onGetLocation}>
              My Location
            </p>
            {!codeMode && <p onClick={() => { setShowfiltersettings(true); }}>filter the map</p>}
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
