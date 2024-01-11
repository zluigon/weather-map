(function () {
    "use strict";

    $(document).ready(function () {

        mapboxgl.accessToken = MAPBOX_KEY;

        const map = new mapboxgl.Map({
            container: 'map', // container ID
            style: 'mapbox://styles/mapbox/streets-v12', // style URL
            center: [-74.11649240171937, 40.979259461189486], // starting position [lng, lat]
            zoom: 12, // starting zoom
        });

        map.on("load", function () {
            map.resize();
        });

        // Add zoom and rotation controls to the map.
        map.addControl(new mapboxgl.NavigationControl());

        // change map style
        $("#weather-style").change(function (e) {
            e.preventDefault();
            let styleValue = $("#weather-style").val();
            map.setStyle(styleValue);
        })

        let updateWeatherLocation = {
            lat: 40.979259461189486,
            lon: -74.11649240171937,
            appid: OPEN_WEATHER_APPID,
            units: "imperial"
        }

        const marker = new mapboxgl.Marker({
            draggable: true,
            color: '#F84C4C'
        })
            .setLngLat([-74.11649240171937, 40.979259461189486])
            .addTo(map);

        function onDragEnd() {
            const lngLat = marker.getLngLat();
            console.log(`onDrag: Longitude: ${lngLat.lng}, Latitude: ${lngLat.lat}`);
            let lat = lngLat.lat
            let lng = lngLat.lng
            updateWeatherLocation.lon = lng
            updateWeatherLocation.lat = lat
            buildWeather();
        }

        marker.on('dragend', onDragEnd);

        map.on('dblclick', (e) => {
            e.preventDefault()
            console.log("dblClick " + e.lngLat)
            updateWeatherLocation.lon = e.lngLat.lng
            updateWeatherLocation.lat = e.lngLat.lat
            buildWeather();
            marker.setLngLat([updateWeatherLocation.lon, updateWeatherLocation.lat])
        });

        $("#myBtn").click(function (e) {
            e.preventDefault();
            let userInput = $("#searchInput").val();
            geocode(userInput, MAPBOX_KEY).then(function (results) {
                // console.log("onSearch " + userInput + " Lng: " + results[0] + ",Lat: " + results[1]);
                // console.log(results[0]); //lon
                // console.log(results[1]); //lat
                updateWeatherLocation.lon = results[0]
                updateWeatherLocation.lat = results[1]
                buildWeather();
                marker.setLngLat([updateWeatherLocation.lon, updateWeatherLocation.lat])
                map.flyTo({
                    center: results,
                    zoom: 12,
                });
            });
        });

        function buildWeather() {

            $.get("https://api.openweathermap.org/data/3.0/onecall", updateWeatherLocation)
                .done(function (data) {
                    // console.log("Onecall API");
                    // console.log(data);

                    function parseDate(timestamp) {
                        return new Date(timestamp * 1000).toLocaleDateString();
                    }

                    let dayOneDate = parseDate(data.daily[0].dt); //current day
                    let dayTwoDate = parseDate(data.daily[1].dt)
                    let dayThreeDate = parseDate(data.daily[2].dt)
                    let dayFourDate = parseDate(data.daily[3].dt)
                    let dayFiveDate = parseDate(data.daily[4].dt)

                    function parseTime(timestamp) {
                        return new Date(timestamp * 1000).toLocaleString([], {hour: '2-digit', minute: '2-digit'});
                    }

                    let dayOneSunrise = parseTime(data.current.sunrise);
                    let dayOneSunset = parseTime(data.current.sunset);

                    if (data.alerts === undefined) {
                        $(".warning").css("display", "none")
                    } else {
                        $(".warning").css("display", "block");
                        $(".warning_content").html(`<span>${data.alerts[0].description}</span>`);
                    }

                    $("#current-weather").html(`<h3>Current Weather: </h3><h2>${data.current.weather[0].main} ${Math.floor(data.current.temp)}&deg;</h2><img src="https://openweathermap.org/img/w/${data.current.weather[0].icon}.png"><h4><img src="img/high-temperature.png"> ${Math.floor(data.daily[0].temp.max)}&deg; <img src="img/low-temperature.png"> ${Math.floor(data.daily[0].temp.min)}&deg; </h4>`);

                    $("#current-misc").html(`<h4><img src="img/fahrenheit.png"> ${Math.floor(data.current.feels_like)}&deg;</h4><h4><img src="img/humidity.png"> ${Math.floor(data.current.humidity)}%</h4><h4><img src="img/wind.png"> ${Math.floor(data.current.wind_speed)} MPH</h4><h4><img src="img/dawn.png"> ${dayOneSunrise}</h4><h4><img src="img/sunset.png"> ${dayOneSunset}</h4>`)

                    $("#day-1").html(`<h5>${dayTwoDate}</h5><h3>${data.daily[1].weather[0].main} ${Math.floor(data.daily[1].temp.day)}&deg;</h3><img src="https://openweathermap.org/img/w/${data.daily[1].weather[0].icon}.png"><h4><img src="img/high-temperature.png"> ${Math.floor(data.daily[1].temp.max)}&deg; <img src="img/low-temperature.png"> ${Math.floor(data.daily[1].temp.min)}&deg; </h4>`);

                    $("#day-2").html(`<h5>${dayThreeDate}</h5><h3>${data.daily[2].weather[0].main} ${Math.floor(data.daily[2].temp.day)}&deg;</h3><img src="https://openweathermap.org/img/w/${data.daily[2].weather[0].icon}.png"><h4><img src="img/high-temperature.png"> ${Math.floor(data.daily[2].temp.max)}&deg; <img src="img/low-temperature.png"> ${Math.floor(data.daily[2].temp.min)}&deg; </h4>`);

                    $("#day-3").html(`<h5>${dayFourDate}</h5><h3>${data.daily[3].weather[0].main} ${Math.floor(data.daily[3].temp.day)}&deg;</h3><img src="https://openweathermap.org/img/w/${data.daily[3].weather[0].icon}.png"><h4><img src="img/high-temperature.png"> ${Math.floor(data.daily[3].temp.max)}&deg; <img src="img/low-temperature.png"> ${Math.floor(data.daily[3].temp.min)}&deg; </h4>`);

                    $("#day-4").html(`<h5>${dayFiveDate}</h5><h3>${data.daily[4].weather[0].main} ${Math.floor(data.daily[4].temp.day)}&deg;</h3><img src="https://openweathermap.org/img/w/${data.daily[4].weather[0].icon}.png"><h4><img src="img/high-temperature.png"> ${Math.floor(data.daily[4].temp.max)}&deg; <img src="img/low-temperature.png"> ${Math.floor(data.daily[4].temp.min)}&deg; </h4>`);
                });

            $.get("https://api.openweathermap.org/data/2.5/weather", updateWeatherLocation).done(function (data) {
                // console.log("Weather API");
                // console.log(data);
                $("#currentLocation").html(`<span class="text-nowrap fs-5 text-light">Current Location: ${data.name}, ${data.sys.country}</span>`)
            });
        }

        buildWeather([-74.11649240171937, 40.979259461189486]); // starting location Ridgewood, NJ
    });
})();



