let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap();
});


/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1IjoiYXJ0ZW1za2kiLCJhIjoiY2p2N2Ficmw2MGR1MjRkbnRlcWxubjJiMiJ9.jkcoEHUQ-A-CdJvGlTy2sA',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}

/* window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
} */

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  if (getParameterByName('user') == 'user') {
    fillCreateReviewHTML();
    addValueListerner();
  }
  fillStars();
  fillRate();
  fillReviewsHTML();

}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

fillStars = () => {
  const rtg = $('#my-data').data()
  if (rtg.rate > 0) {
    const stars = document.getElementById("stars");
    stars.innerHTML = getStars(rtg.rate);
  }
}

fillRate = () => {
  const rtg = $('#my-data').data()
  if (rtg.rate > 0) {
    const trate = document.getElementById("rate");
    trate.innerHTML = rtg.rate + ' out of 5 stars';
  }
}

getStars = (rating) => {

  // Round to nearest half
  const rate = Math.round(rating * 2) / 2;
  let output = [];

  // Append all the filled whole stars
  for (var i = rate; i >= 1; i--)
    output.push('<i class="fa fa-star" aria-hidden="true" style="color: gold;"></i>&nbsp;');

  // If there is a half a star, append it
  if (i == .5) output.push('<i class="fa fa-star-half-o" aria-hidden="true" style="color: gold;"></i>&nbsp;');

  // Fill the empty stars
  for (let i = (5 - rate); i >= 1; i--)
    output.push('<i class="fa fa-star-o" aria-hidden="true" style="color: gold;"></i>&nbsp;');

  return output.join('');

}

fillCreateReviewHTML = () => {
  const container = document.getElementById('form-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Create Review';
  container.appendChild(title);

  const f = document.createElement("form");
  f.setAttribute('method',"post");
  f.setAttribute('action',"");
  f.setAttribute('id', 'formsub');

  const label1 = document.createElement('p');
  label1.innerHTML = 'Name:';

  const i = document.createElement("input");
  i.setAttribute('type',"text");
  i.setAttribute('size',"30");
  i.setAttribute('name',"name");

  const label2 = document.createElement('p');
  label2.innerHTML = 'Comments:';

  const txtbox = document.createElement('textarea');
  txtbox.setAttribute('name', "comments");
  txtbox.setAttribute('rows', "20");
  txtbox.setAttribute('cols', "50");

  const label3 = document.createElement('p');
  label3.innerHTML = "Please rate:";

  const d = document.createElement("div");
  d.setAttribute('id',"status");

  const fldset = document.createElement('fieldset');
  fldset.setAttribute('class', 'rating');
  fldset.setAttribute('id', 'rating');
  int1 = document.createElement('input');
  int1.setAttribute('type', 'radio');
  int1.setAttribute('id', 'star5');
  int1.setAttribute('name', 'rating');
  int1.setAttribute('value', '5');

  lb1 = document.createElement('label');
  lb1.setAttribute('for', "star5")
  lb1.innerHTML = "5 star";

  wr = document.createElement('div');
  wr.setAttribute('id', "wr");

  int2 = document.createElement('input');
  int2.setAttribute('type', 'radio');
  int2.setAttribute('id', 'star4');
  int2.setAttribute('name', 'rating');
  int2.setAttribute('value', '4');

  lb2 = document.createElement('label');
  lb2.setAttribute('for', "star4")
  lb2.innerHTML = "4 star";

  int3 = document.createElement('input');
  int3.setAttribute('type', 'radio');
  int3.setAttribute('id', 'star3');
  int3.setAttribute('name', 'rating');
  int3.setAttribute('value', '3');

  lb3 = document.createElement('label');
  lb3.setAttribute('for', "star3")
  lb3.innerHTML = "3 star";

  int4 = document.createElement('input');
  int4.setAttribute('type', 'radio');
  int4.setAttribute('id', 'star2');
  int4.setAttribute('name', 'rating');
  int4.setAttribute('value', '2');

  lb4 = document.createElement('label');
  lb4.setAttribute('for', "star2")
  lb4.innerHTML = "2 star";

  int5 = document.createElement('input');
  int5.setAttribute('type', 'radio');
  int5.setAttribute('id', 'star1');
  int5.setAttribute('name', 'rating');
  int5.setAttribute('value', '1');

  lb5 = document.createElement('label');
  lb5.setAttribute('for', "star1")
  lb5.innerHTML = "1 star";

  fldset.appendChild(int1);
  fldset.appendChild(lb1);
  fldset.appendChild(int2);
  fldset.appendChild(lb2);
  fldset.appendChild(int3);
  fldset.appendChild(lb3);
  fldset.appendChild(int4);
  fldset.appendChild(lb4);
  fldset.appendChild(int5);
  fldset.appendChild(lb5);

  const label4 = document.createElement('p');
  label4.innerHTML = '';

  const s = document.createElement("input");
  s.setAttribute('type',"submit");
  s.setAttribute('value',"Create");
  s.setAttribute('id',"review");

  wr.innerHTML += fldset.outerHTML;

  const ratg = document.createElement("input");
  ratg.setAttribute("type", "hidden");
  ratg.setAttribute("name", "rte");



  f.appendChild(label1);
  f.appendChild(i);
  f.appendChild(label2);
  f.appendChild(txtbox);
  f.appendChild(label3);
  f.appendChild(d)
  f.appendChild(wr);
  f.appendChild(label4);
  f.appendChild(ratg);
  f.appendChild(s);

  container.appendChild(f);
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews[0]) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

//$( "form" ).submit(function( event ) {

  //var formData = JSON.stringify($(this).serializeArray());
  //console.log(formData);
  //$.post("restaurant", formData, function(){
//	});
//  event.preventDefault();
//});

//var testForm = document.getElementById('test-form');
//  testForm.onsubmit = function(event) {
  //  event.preventDefault();
  //  var formElements = document.forms['test-form'].elements['Input1'].value;
    //var formData = new FormData(document.getElementById('test-form'));
  //  var formData = JSON.stringify($(this)).serializeArray();
  //  console.log(formData);
  //  self.restaurant.reviews[0].comments = formData.get('input1');
  //  console.log(self.restaurant.reviews);
  //}





/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = review.date;
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

addValueListerner = () => {
  var el = document.getElementById("wr");
  el.addEventListener('click', addValue, false);
}

addValue = () => {
  console.log($('input:radio[name=rating]:checked').val());
  var rting = $('input:radio[name=rating]:checked').val();
  var r = document.getElementsByName("rte");
  if (rting != null){
    $(r).attr('value', rting);
  }
}
