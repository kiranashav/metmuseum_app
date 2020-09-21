function onChecked(termsCheckBox) {

    var counter = 0;
    for (var i = 0; i < document.galleryForm.selectChkBox.length; i++) {

        if (document.galleryForm.selectChkBox[i].checked) {
            counter = counter + parseInt(document.galleryForm.selectChkBox[i].value);
        }
        if (counter > 10) {
            counter = counter - parseInt(document.galleryForm.selectChkBox[i].value);
            document.galleryForm.selectChkBox[i].checked = false;
            alert("Sorry!! Cannot Select more than 5 items. Please select upto 5 items only.")
        }
    }
}


function saveSelectedImages() {
    var grid = document.getElementById("art_table");
    var checkBoxes = grid.getElementsByTagName("INPUT");
    var message = "Artist ArtWorkTitle                  Details\n";

    for (var i = 0; i < checkBoxes.length; i++) {
        if (checkBoxes[i].checked) {
            var row = checkBoxes[i].parentNode.parentNode;
            message += row.cells[1].innerHTML;
            message += "   " + row.cells[2].innerHTML;
            message += "   " + row.cells[3].innerHTML;
            message += "\n";
        }
    }
    //Display saved data in Alert Box.
    alert(message);
}

window.onload = function () {

    let finalGallery = [];

    var processRequest = function (url, method) {

        var request = new XMLHttpRequest();
        // returns Promise
        return new Promise(function (resolve, reject) {

            // Listener to process compeleted requests
            request.onreadystatechange = function () {
                if (request.readyState !== 4) return;
                // Process/Resolve the response
                if (request.status >= 200 && request.status < 300) {
                    // On Sucess
                    resolve(request);
                } else { // On Failure
                    reject({
                        status: request.status,
                        statusText: request.statusText
                    });
                }

            };
            request.open(method || 'GET', url, true);
            request.send();
        });
    };

    processRequest('https://collectionapi.metmuseum.org/public/collection/v1/objects')
        .then(async function (objectID) {
            let promises = [];
            let x = JSON.parse(objectID.responseText).objectIDs.slice(289, 314);
            for (let i in x) {
                promises.push(processRequest('https://collectionapi.metmuseum.org/public/collection/v1/objects/' + x[i]));
            }
            let result = await Promise.all(promises);
            for (let i = 0; i < result.length; i++) {
                let finalResponse = JSON.parse(result[i].responseText);
                finalGallery.push({
                    'Artist': finalResponse.artistDisplayName,
                    'ArtWorkTitle': finalResponse.title,
                    'ArtWorkImage': finalResponse.primaryImageSmall,
                    'Details': finalResponse.objectURL
                });
            }
            return finalGallery;

        }).catch(function (error) {
            console.log('Something went wrong', error);
        });

    generateGalleryTable = () => {

        let _html = `<tr class ="theader">
        <th>Select Item</th>
        <th>Artist</th>
        <th>Art Work Title</th>s
        <th>Art Work Image</th>
        <th>Details</th>
    </tr>`;

        for (let i = 0; i < finalGallery.length; i++) {
            _html += `<tr>
            <td><input type="checkbox" name = "selectChkBox" class="check-box"  value="${[i]}" onclick="onChecked(this)"/></td>
            <td>${finalGallery[i].Artist}</td>
            <td>${finalGallery[i].ArtWorkTitle}</td>
            <td><img class = "gallery-img" alt = "Gallery Image" src= "${finalGallery[i].ArtWorkImage}"></td>
            <td><a class="view-icon" target="_blank" href="${finalGallery[i].Details}"><i class="fas fa-lightbulb fa-fw"></i>View</a></td>
        </tr>`;
        }
        art_table.innerHTML = _html;
    }
}