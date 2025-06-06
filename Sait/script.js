const API_BASE_URL = 'http://localhost:8082/component';

document.addEventListener('DOMContentLoaded', () => {
    // Инициализация элементов
    const homePage = document.getElementById('homePage');
    const carPage = document.getElementById('carPage');
    const adminPage = document.getElementById('adminPage');
    const homeLink = document.getElementById('homeLink');
    const adminLink = document.getElementById('adminLink');
    const backButton = document.getElementById('backButton');
    const carsGrid = document.getElementById('carsGrid');
    const carDetail = document.getElementById('carDetail');
    const addCarForm = document.getElementById('addCarForm');
    const refreshCarsBtn = document.getElementById('refreshCars');
    const adminCarsList = document.getElementById('adminCarsList');
    const carSearch = document.getElementById('carSearch');

    // Навигация
    homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('homePage');
        loadCars();
    });
    
    adminLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('adminPage');
        loadAdminCars();
    });
    
    backButton.addEventListener('click', () => showPage('homePage'));

    // Загрузка данных
    refreshCarsBtn?.addEventListener('click', loadAdminCars);
    addCarForm?.addEventListener('submit', handleAddCar);
    carSearch?.addEventListener('input', (e) => searchCars(e.target.value));

    // Инициализация
    showPage('homePage');
    loadCars();
});

// Функции
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

async function loadCars() {
    try {
        const response = await fetch(API_BASE_URL);
        const components = await response.json();
        displayCars(components);
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        alert('Не удалось загрузить каталог автомобилей');
    }
}

async function searchCars(query) {
    if (!query || query.length < 2) {
        loadCars();
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}`);
        const cars = await response.json();
        displayCars(cars);
    } catch (error) {
        console.error('Ошибка поиска:', error);
    }
}

function displayCars(cars) {
    const grid = document.getElementById('carsGrid');
    grid.innerHTML = '';
    
    if (!cars?.length) {
        grid.innerHTML = '<p>Автомобили не найдены</p>';
        return;
    }
    
    cars.forEach(car => {
        // Парсим данные из description и specs
        const carData = parseCarData(car);
        
        const card = document.createElement('div');
        card.className = 'car-card';
        card.innerHTML = `
            <div class="car-image" style="background-color: #f0f0f0; background-image: url('${car.imageUrl || 'default-car.jpg'}')"></div>
            <div class="car-info">
                <h3>${carData.brand} ${carData.model}</h3>
                <span class="car-type">${getTypeName(carData.type)}</span>
                <div class="car-meta">
                    <span><i class="fas fa-calendar-alt"></i> ${carData.year}</span>
                    <span><i class="fas fa-tachometer-alt"></i> ${carData.mileage || '—'} км</span>
                </div>
                <p class="car-price">${carData.price}$</p>
            </div>
        `;
        card.addEventListener('click', () => showCarDetail(car.id));
        grid.appendChild(card);
    });
}

function parseCarData(component) {
    // Используем name для хранения марки и модели в формате "Brand Model"
    const [brand = '', model = ''] = component.name.split(' ');
    
    // Парсим дополнительные данные из description и specs
    const yearMatch = component.description?.match(/Год: (\d+)/);
    const mileageMatch = component.specs?.match(/Пробег: (\d+) км/);
    const priceMatch = component.specs?.match(/Цена: (\d+)\$/);
    
    return {
        brand,
        model,
        year: yearMatch?.[1] || '—',
        mileage: mileageMatch?.[1],
        price: priceMatch?.[1] || '—',
        type: component.type,
        description: component.description,
        specs: component.specs
    };
}

function getTypeName(type) {
    const types = {
        'SEDAN': 'Легковой',
        'SUV': 'Внедорожник',
        'COMMERCIAL': 'Коммерческий'
    };
    return types[type] || type;
}

async function showCarDetail(carId) {
    try {
        const response = await fetch(`${API_BASE_URL}/${carId}`);
        const car = await response.json();
        
        if (!car) throw new Error('Автомобиль не найден');
        renderCarDetail(car);
        showPage('carPage');
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось загрузить информацию об автомобиле');
    }
}

function renderCarDetail(car) {
    const detail = document.getElementById('carDetail');
    const carData = parseCarData(car);
    
    detail.innerHTML = `
        <div class="detail-header">
            <div class="detail-image" style="background-image: url('${car.imageUrl || 'default-car.jpg'}')"></div>
            <div class="detail-title">
                <h2>${carData.brand} ${carData.model}</h2>
                <div class="detail-meta">
                    <span class="car-type">${getTypeName(carData.type)}</span>
                    <span><i class="fas fa-calendar-alt"></i> ${carData.year} год</span>
                    <span><i class="fas fa-tachometer-alt"></i> ${carData.mileage || '—'} км</span>
                </div>
                <div class="detail-price">${carData.price}$</div>
                
                <h3>Описание:</h3>
                <p>${carData.description?.replace(/Год: \d+/, '') || 'Нет описания'}</p>
                
                <h3>Характеристики:</h3>
                <ul class="car-specs">
                    ${carData.specs?.split('\n').map(spec => spec.trim() ? `<li>${spec.replace(/Цена: \d+\$/, '')}</li>` : '').join('') || '<li>Нет характеристик</li>'}
                </ul>
            </div>
        </div>
    `;
}

async function loadAdminCars() {
    try {
        const response = await fetch(API_BASE_URL);
        const cars = await response.json();
        displayAdminCars(cars);
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось загрузить каталог');
    }
}

function displayAdminCars(cars) {
    const list = document.getElementById('adminCarsList');
    list.innerHTML = '';
    
    if (!cars?.length) {
        list.innerHTML = '<p>Нет автомобилей в каталоге</p>';
        return;
    }
    
    cars.forEach(car => {
        const carData = parseCarData(car);
        
        const item = document.createElement('div');
        item.className = 'admin-car-item';
        item.innerHTML = `
            <div>
                <h4>${carData.brand} ${carData.model}</h4>
                <small>${getTypeName(carData.type)} • ${carData.year} • ${carData.price}$</small>
            </div>
            <div class="admin-car-actions">
                <button class="edit-btn" data-id="${car.id}">Изменить</button>
                <button class="delete-btn" data-id="${car.id}">Удалить</button>
            </div>
        `;
        list.appendChild(item);
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            deleteCar(e.target.getAttribute('data-id'));
        });
    });
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            editCar(e.target.getAttribute('data-id'));
        });
    });
}

async function handleAddCar(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = {
        name: `${form.carBrand.value} ${form.carModel.value}`,
        type: form.carType.value,
        description: `Год: ${form.carYear.value}\n${form.carDesc.value}`,
        specs: `Цена: ${form.carPrice.value}$\nДополнительные характеристики`,
        imageUrl: "default-car.jpg"
    };
    
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Ошибка сервера');
        }
        
        const result = await response.json();
        alert(`Автомобиль "${form.carBrand.value} ${form.carModel.value}" добавлен в каталог!`);
        form.reset();
        loadAdminCars();
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при добавлении: ' + error.message);
    }
}

async function deleteCar(id) {
    if (!confirm('Вы уверены, что хотите удалить этот автомобиль?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Ошибка при удалении');
        
        alert('Автомобиль успешно удален');
        loadAdminCars();
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при удалении: ' + error.message);
    }
}

async function editCar(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        const car = await response.json();
        
        if (!car) throw new Error('Автомобиль не найден');
        
        const carData = parseCarData(car);
        const form = document.getElementById('addCarForm');
        
        // Заполняем форму редактирования
        form.carBrand.value = carData.brand;
        form.carModel.value = carData.model;
        form.carYear.value = carData.year;
        form.carType.value = car.type;
        form.carPrice.value = carData.price;
        form.carDesc.value = car.description?.replace(/Год: \d+/, '').trim();
        
        // Прокручиваем к форме
        form.scrollIntoView();
        
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при загрузке данных автомобиля: ' + error.message);
    }
}