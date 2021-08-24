const ACTIVE_CLASS = 'active';
const listViewState = 'list';
const cardViewState = 'card';
const url = 'https://my-json-server.typicode.com/moviedb-tech/movies/list/';
const moviesCardBlock = document.querySelector('.movies-card');
const moviesListBlock = document.querySelector('.movies-list');
const favoriteList = document.querySelector('.fav-list');
const detailsModal = document.querySelector('.details-modal');
const viewBlock = document.querySelector('.view-block');
const select = document.querySelector('#ganres-select');

init()

function init(){
    fetch(url)
        .then(response => response.json())
        .then((result) => {
            renderMoviesSection(result)
            renderFavoriteList(result);
            getGenres(result)
            selectGenre(result)
            toggleViewMode(result)
        })

    let view = localStorage.getItem('view');
    if(view === listViewState){
        moviesListBlock.style.display = 'grid'
        moviesCardBlock.style.display = 'none'
        document.querySelector('.fa-th').classList.remove(ACTIVE_CLASS);
        document.querySelector('.fa-th-list').classList.add(ACTIVE_CLASS);
    } else {
        moviesListBlock.style.display = 'none'
        moviesCardBlock.style.display = 'grid'
        document.querySelector('.fa-th').classList.add(ACTIVE_CLASS);
        document.querySelector('.fa-th-list').classList.remove(ACTIVE_CLASS);
    }
}

function renderMoviesSection(list) {
    let cardFragment = document.createDocumentFragment();
    let listFragment = document.createDocumentFragment();
    for (let elem of list){
        let cardItem = document.createElement('div');
        let listItem = document.createElement('div');
        cardItem.className = "card-item";
        listItem.className = "list-item";
        cardItem.setAttribute('data-target', `${elem.id}`);
        listItem.setAttribute('data-target', `${elem.id}`);
        cardItem.innerHTML = `<img src="${elem.img}" class="img" alt="${elem.name}">
                        <button type="button" class="add-favorite" data-id="${elem.id}"><i class="fas fa-star"></i></button>
                        <h3 class="name">${elem.name}</h3>
                        <p class="year">${elem.year}</p>`
        listItem.innerHTML = `<img src="${elem.img}" class="img list" alt="${elem.name}">
                        <button type="button" class="add-favorite list" data-id="${elem.id}"><i class="fas fa-star"></i></button>
                        <div>
                            <h3 class="name list">${elem.name}</h3>
                            <p class="year list">${elem.year}</p>
                            <p class="description-string">${elem.description}></p>
                        </div>`
        let genresBlock = document.createElement('div');
        genresBlock.classList.add('genres-block', 'list');
        for (let genre of elem.genres){
            let item = document.createElement('div');
            item.innerText = genre;
            genresBlock.append(item)
        }
        listItem.querySelector('.description-string').after(genresBlock);
        cardFragment.append(cardItem);
        listFragment.append(listItem);
        addItemsEvent(cardItem, elem);
        addItemsEvent(listItem, elem);
    }
    moviesCardBlock.append(cardFragment);
    moviesListBlock.append(listFragment);
    setActiveFavoriteIcons();
}

function addItemsEvent(item, elem){
    item.addEventListener('click', function(e){
        if(e.target.classList.contains('fa-star')){
            favoriteBtnHandle(e, elem);
        } else {
            detailsModal.style.display = 'block';
            let details = document.querySelector('.detail-block');
            details?.remove()
            getMovieDetails(elem.id)
        }
    })
}

function favoriteBtnHandle(e, elem){
    let iconButtons = [...document.querySelectorAll('[data-id]')];
    if(e.target.classList.contains(ACTIVE_CLASS)){
        e.target.classList.remove(ACTIVE_CLASS);
        removeFavoriteMovie(elem);
        let favoriteList = document.querySelectorAll('.fav-list>div');
        for(let removingMovie of favoriteList){
            if(removingMovie.innerText === elem.name){
                removingMovie.remove()
            }
        }
        for(let icon of iconButtons){
            if(icon.dataset.id == e.target.parentElement.dataset.id){
                icon.childNodes[0].classList.remove(ACTIVE_CLASS)
            }
        }
    } else {
        e.target.classList.add(ACTIVE_CLASS);
        addFavoriteMovie(elem);
        addMovieToFavoriteList(elem);
        for(let icon of iconButtons){
            if(icon.dataset.id == e.target.parentElement.dataset.id){
                icon.childNodes[0].classList.add(ACTIVE_CLASS)
            }
        }
    }
}

function getMovieDetails(id){
    fetch(url+id)
        .then(response => response.json())
        .then(result => renderMovieDetails(result))
}

function renderMovieDetails(info) {
    let leftSide = document.querySelector('.left-side');
    let rightSide = document.querySelector('.right-side');
    leftSide.innerHTML = `<img src="${info.img}" class="img-detail" alt="${info.name}">
                            <button type="button" class="add-favorite" data-id="${info.id}"><i class="fas fa-star"></i></button>
                            <p class="year">${info.year} year</p>`
    rightSide.innerHTML = `<h3 class="movie-name">${info.name}</h3>
                            <div class="description">
                                <p>${info.description}</p>
                            </div> 
                            <div class="team">
                                <p>Director: ${info.director}</p>
                                <p>Starring: ${info.starring.join(', ')} </p>
                            </div>`
    let genresBlock = document.createElement('div');
    genresBlock.className = 'genres-block';
    for (let genre of info.genres){
        let item = document.createElement('div');
        item.innerText = genre;
        genresBlock.append(item)
    }
    leftSide.append(genresBlock)
    setActiveFavoriteIcons()
    leftSide.querySelector('.add-favorite').addEventListener('click', (e)=>{
        favoriteBtnHandle(e, info);
    })
}

function addFavoriteMovie(value) {
    let favoriteArray = JSON.parse(localStorage.getItem('favorites'))||[];
    favoriteArray.push(value.id)
    localStorage.setItem('favorites',JSON.stringify(favoriteArray))
}

function removeFavoriteMovie(value) {
    let storageArray = JSON.parse(localStorage.getItem('favorites')).filter(item => item !== value.id);
    localStorage.setItem('favorites',JSON.stringify(storageArray));
}

function setActiveFavoriteIcons(){
    let storageArray = JSON.parse(localStorage.getItem('favorites'));
    if(storageArray){
        let iconButtons = [...document.querySelectorAll('[data-id]')];
        let idValuesArray = iconButtons.map(el => +el.getAttribute('data-id'))
        let activeIcons = idValuesArray.filter(el => idValuesArray[storageArray.indexOf(el)])
        for (let icon of iconButtons){
            for(let i=0; i < activeIcons.length; i++){
                if(icon.dataset.id == activeIcons[i]){
                    icon.childNodes[0].classList.add(ACTIVE_CLASS)
                }
            }
        }
    }
}

function renderFavoriteList(list) {
    let favoriteArray = JSON.parse(localStorage.getItem('favorites'));
    if(favoriteArray){
        let moviesNames = list.filter((el) => {
            for(let i=0; i < favoriteArray.length; i++){
                if(el.id == favoriteArray[i]){
                    return el
                }
            }
        })
        for (let movie of moviesNames){
            addMovieToFavoriteList(movie)
        }
    }
}

function addMovieToFavoriteList(movie){
    let item = document.createElement('div');
    item.innerHTML = `<i class="fas fa-arrow-right"></i>
                     <p class="fav-name">${movie.name}</p>
                     <i class="far fa-times-circle"></i>`
    favoriteList.append(item)
    item.querySelector('.fa-times-circle').addEventListener('click',function(){
        this.parentElement.remove();
        let iconButtons = [...document.querySelectorAll('[data-id]')];
        for(let icon of iconButtons){
            if(icon.dataset.id == movie.id){
                icon.childNodes[0].classList.remove(ACTIVE_CLASS)
            }
        }
    })
    item.querySelector('.fav-name').addEventListener('click',()=>{
        detailsModal.style.display = 'block';
        let details = document.querySelector('.detail-block');
        details?.remove()
        getMovieDetails(movie.id)
    })
}

function getGenres(list){
    const modifiedMovies = list.map(el => modifyMovies(el))
    const allGenres = new Set(modifiedMovies.flatMap(el => el.genres));
    let fragment = document.createDocumentFragment();
    for (let genre of allGenres){
        let option = document.createElement("option");
        option.value = genre;
        option.textContent = genre;
        fragment.append(option);
    }
    select.append(fragment);
}

function selectGenre(movies){
    document.querySelector('.select-form').addEventListener('change', function(){
        genresFilter(movies, select.value)
        setActiveFavoriteIcons()
    })
}

function genresFilter(movies, value){
    let targetMoviesId;
    let items;
    let selectedItems;
    let viewState = localStorage.getItem('view');
    const modifiedMovies = movies.map(el => modifyMovies(el))
    const targetMovies = modifiedMovies.filter(el => el.genres.includes(value));
    targetMoviesId = targetMovies.map(el => el.id);
    if(viewState === listViewState) {
        moviesListBlock.style.display = 'grid';
        moviesCardBlock.style.display = 'none';
        items = [...document.querySelectorAll('.list-item')];
        for (let item of items){
            item.classList.add('hidden');
        }
    } else {
        moviesCardBlock.style.display = 'grid';
        moviesListBlock.style.display = 'none';
        items = [...document.querySelectorAll('.card-item')];
        for (let item of items){
            item.classList.add('hidden');
        }
    }
    if(value === "all" || value === "default"){
        targetMoviesId = movies.map(el => el.id)
    }
    selectedItems = items.filter((el) => {
        for (let i = 0; i < targetMoviesId.length; i++){
            if(+el.dataset.target == targetMoviesId[i]){
                return el
            }
        }
    })
    for (let item of selectedItems){
        item.classList.remove('hidden');
    }
}

function modifyMovies(info) {
    const movie = {
        ...info,
    };
    movie.genres = info.genres.map(el => el.toLowerCase())
    return movie;
}

function toggleViewMode(list){
    viewBlock.addEventListener('click', function(e){
        if(e.target.classList.contains('fa-th')){
            e.target.classList.add(ACTIVE_CLASS);
            e.target.nextElementSibling.classList.remove(ACTIVE_CLASS);
            moviesCardBlock.style.display = 'grid';
            moviesListBlock.style.display = 'none';
            localStorage.setItem('view', cardViewState);
        } else if(e.target.classList.contains('fa-th-list')) {
            e.target.classList.add(ACTIVE_CLASS);
            e.target.previousElementSibling.classList.remove(ACTIVE_CLASS);
            moviesListBlock.style.display = 'grid';
            moviesCardBlock.style.display = 'none';
            localStorage.setItem('view', listViewState);
        }
        genresFilter(list, select.value)
    })
}

document.querySelector('.close-btn').addEventListener('click', ()=>{
    detailsModal.style.display = 'none';
})
