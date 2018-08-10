var express = require('express');
var router  = express.Router();
// var http    = require('http');
var https   = require('https');

/* GET home page. */
router.get('/hotels/search', function(req, res, next){
  res.render('index', (err, text) =>{
    getHotelData(res);
  });
});

function getHotelData(res){
  const expediaURL     = 'https://www.hipmunk.com/interviews/hotel_search/scraper/Expedia';
  const orbitzURL      = 'https://www.hipmunk.com/interviews/hotel_search/scraper/Orbitz';
  const pricelineURL   = 'https://www.hipmunk.com/interviews/hotel_search/scraper/Priceline';
  const travelocityURL = 'https://www.hipmunk.com/interviews/hotel_search/scraper/Travelocity';
  const hiltonURL      = 'https://www.hipmunk.com/interviews/hotel_search/scraper/Hilton';

  const expedia     = apiRequest(expediaURL);
  const orbitz      = apiRequest(orbitzURL);
  const priceline   = apiRequest(pricelineURL);
  const travelocity = apiRequest(travelocityURL);
  const hilton      = apiRequest(hiltonURL);

  Promise.all([expedia, orbitz, priceline, travelocity, hilton]).then((arr) =>{
    // console.log(arr);
    const hotels = formatHotelData(arr);
    // res.send(hotels)
    res.render('index', {title: 'Hotels by Base Ecstasy', data : hotels})
  }).catch(e =>{
    console.log(e);
  });
}


function apiRequest(url){
  return new Promise(function(resolve, reject){

    https.get(url, (response) =>{
      let allText = '';

      response.on('data', chunk =>{
        // console.log('chunk:', chunk.toString());
        allText += chunk.toString()

      }).on('close', function(){
        console.log('written in the CLIENT file: CLOSE event heard');
        // res.send('Close: ' + allText)
        resolve(allText)
      }).on('end', function(){
        console.log('written in the CLIENT file: END event heard');
        // res.send('End: ' + allText)
        resolve(allText)
      }).on('error', e =>{
        console.log('Got error: ', e.message);
      });
    });
  })
    .catch(function(err){
      //return error;
      return err;
    });
}

function formatHotelData(arr){

  let hotelsInOrder     = orderHotels(arr);
  let hotelsWithoutDups = removeDuplicateHotels(hotelsInOrder);

  return hotelsWithoutDups.map((hotel) =>{
    return {
      ecstasy     : `base ecstasy: ${hotel.base_ecstasy.toFixed(3)}  :::   ecstasy: ${hotel.ecstasy}`,
      description : hotel.description,
      address     : `${hotel.address}, ${hotel.city_name}, ${hotel.country_code}`,
      name        : hotel.name
    }
  });

}

function orderHotels(arr){
  return arr.reduce((sortedHotels, hotelList, idx) =>{

    let json   = JSON.parse(hotelList);
    let hotels = json.results;

    if(!idx){
      sortedHotels.concat(hotels)
    } else{
      let tempHotels = sortedHotels.concat(hotels);
      sortedHotels   = insertionSort(tempHotels);
    }
    return sortedHotels;
  }, []);
}

function insertionSort(arr){ // sort current array in place

  for(var i = 1; i < arr.length; i++){
    var val  = arr[i];
    var hole = i;

    while((hole > 0 && comparator(val, arr[hole - 1])) === -1){
      arr[hole] = arr[hole - 1];
      hole -= 1;
    }

    arr[hole] = val;
  }

  return arr;
};

function comparator(a, b){
  // We only need to know if a is less than b
  return a.base_ecstasy > b.base_ecstasy ? -1 : 0;
}

function removeDuplicateHotels(hotels){
  // id duplicate hotels with name and address
  let hotelObj = {};

  return hotels.filter(hotel =>{
    let name       = hotel.name.toLowerCase();
    let addr       = hotel.address; // no decimals place
    let isNewHotel = !hotelObj[name] || hotelObj[name] != addr;
    if(isNewHotel){
      hotelObj[name] = addr;
    }
    return isNewHotel;
  })
}

module.exports = router;
