let names
/**
 * Fetch names as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNames();
});

fetchNames = () => {
  DBHelper.fetchNames((error, names) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.names = names;
      fillNamesHTML();
    }
  });
}

/**
 * Set names HTML.
 */

fillNamesHTML = (names = self.names) => {
  const select = document.getElementById('names-select');
  names.forEach(name => {
    const option = document.createElement('option');
    option.innerHTML = name;
    option.value = name;
    select.append(option);
  });
}




let file_input = document.getElementById('file');
let obj_input = document.getElementById('new');

file_input.addEventListener('change', (event) => {
  onFileSelect()
});

onFileSelect = () => {
  if(file_input.files.length > 0) {
    let file = file_input.files[0]
    // clear the data from the file input element
    file_input.value = ''

    // constrain the file size to 500kb
    if(file.size < 500000) { // bytes
      let fd = new FormData()
      fd.append('image', file)
      axios.post('/img', fd, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(response=> {
        console.log('success');
        // handle succoncess
      })
      .catch(err=> {
        console.log(err.message);
        // handle error
      })
    } else {
      console.log('error');
       // show an error
    }
  }
}
