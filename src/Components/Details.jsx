import React, { useEffect, useState } from "react";

function Details() {
  const [inputCity, setInputCity] = useState("");
  const [cityList, setCityList] = useState(["Mumbai","London"]);
  const [error, setError] = useState(null);
  const [allCityWeatherDetails , setAllCityWeatherDetails] = useState([])
  const [searchInput , setSearchInput] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(null); 


  // fetching single city using open weather api
  const fetchSingleCity = async (cityName) => {
  
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${
          import.meta.env.VITE_WEATHER_API_KEY
        }&units=metric`
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const results = await response.json();
      console.log(results)
        return results;
    } catch (err) {
      throw err;
    }
  };

  // fetching all cityList name weather details
  const fetchAllCityList = async () => {
    const newList = [];
    try {
      for (const cityName of cityList) {
        const weatherDetails = await fetchSingleCity(cityName);
        if (weatherDetails) {
          newList.push({ cityName, weatherDetails });
        }
      }
      setAllCityWeatherDetails(newList);
      setError("")
    } catch (err) {
        setError("Failed to fetch weather data. Please try again later."); 
    }
  };


  // handle add city button
  const handleAddCity = async () => {

    if (inputCity.trim() !== "") {
      // here i am call api to make sure that what ever user entering city name it should have some weather details then only i will add on my city list
      try {
        const weatherData = await fetchSingleCity(inputCity.trim());
        if (weatherData) {
          setCityList((prevCityList) => [...prevCityList, inputCity.trim()]);
          setInputCity("");
          setError("");
        } else {
          // here means either name of user is not valid or an api issue
          setError(
            "Failed to fetch weather data for the city. Please try again later."
          );
        }
      } catch (err) {
        setError(
          "Failed to fetch weather data for the city. Please try again later."
        );
      }
    }
  };

 // handle get Weather button
 const handleGetWeather = async()=>{
     try{
        await fetchAllCityList();
        setError("")
     }catch(err){
        setError("Failed to fetch weather data. Please try again later.");
     }
 }

 // search handler 
 const handleSearch = ()=>{
    const searchIndex = allCityWeatherDetails.findIndex((data,index)=> data.cityName.toLowerCase() === searchInput.toLowerCase())
    setHighlightedIndex(searchIndex);
    setSearchInput("");
 }

 // delete handler
 const handleDelete = (e,index)=>{
   setAllCityWeatherDetails((prevCityWeatherDetails) =>{
     const newList = [...prevCityWeatherDetails];
     newList.splice(index,1);
     return newList;
   })
 }

 const handleDate = (dt) => {
    if (!dt) return 'N/A';
    const currentTime = new Date().getTime();
    const weatherTime = dt * 1000;
    const timeDiff = Math.abs(currentTime - weatherTime);
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    const roundedHours = Math.round(hoursDiff * 100) / 100;
    return `${roundedHours} hours ago`;
}


 // highlight the search term for 2sec
 useEffect(()=>{
    const id = setTimeout(()=>{
       setHighlightedIndex(null);
    },3000)
    return ()=>{
        clearTimeout(id);
    }
 },[highlightedIndex])


  return (
    <>
      <div className="app">

        <div className="city-list">
          <h1>City List</h1>
          <input
            type="text"
            value={inputCity}
            onChange={(e) => setInputCity(e.target.value)}
            placeholder="Enter city"
            className="searchCityText"
          />
          <div className="city-list-buttons">
            <button onClick={handleAddCity}>Add City</button>
            <button onClick={handleGetWeather}>Get Weather</button>
          </div>

          <table>
             <thead>
                <tr>
                    <th>City</th>
                </tr>
             </thead>
            <tbody>
               {
                 cityList.length > 0 ? (
                    cityList.map((city,index) => (
                        <tr key={index}>
                            <td>{city}</td>
                        </tr>
                    ))
                 ) : (
                    <tr>
                        <td>No Data</td>
                    </tr>
                 )
               }
            </tbody>
          </table>
          {error && <p className="error-message">Please add proper city</p>}
        </div>

        <div className="details">
          <h1>Details</h1>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search"
          />
          <button onClick={handleSearch}>Search</button>
          <table>
            <thead>
              <tr>
                <th>City</th>
                <th>Description</th>
                <th>Temperature (°C)</th>
                <th>Pressure (hPa)</th>
                <th>Data Age (hours)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {allCityWeatherDetails.length > 0 ? (
                allCityWeatherDetails.map(({ cityName, weatherDetails }, index) => (
                  <tr
                    key={index}
                    className={
                      highlightedIndex === index ? "highlighted" : ""
                    }
                  >
                    <td>{cityName}</td>
                    <td>{weatherDetails?.weather[0]?.description}</td>
                    <td>{weatherDetails?.main?.temp}</td>
                    <td>{weatherDetails?.main?.pressure}</td>
                    <td>
                    {handleDate(weatherDetails?.dt)}
                    </td>
                    <td>
                      <button
                        onClick={(e) => handleDelete(e,index)}
                        id="deleteBtn"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No Data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default Details;
