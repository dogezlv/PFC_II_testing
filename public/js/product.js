class ProductPage {
	constructor() {
		// Read article id
		let id = this.getLoadedProductId()
		let article = articlesData[id] || null

		// Redirect if article is not present
		if (article == null) {
			document.location = './catalog.html'
		}

		this.id = id
		this.setTitle(article.title)
		// this.setDescription(article.description)
		this.description = article.description
		this.variations = article.variations
		this.categories = article.categories
		this.images = article.images
		this.stock = article.stock
		this.shipment = article.shipment_type
		this.price = article.price
		this.stars = Math.round(article.stars)
	}

	setTitle(title) {
		pushText(this.id + '_title', title)
	}

	setDescription(desc) {
		pushText(this.id + '_desc', desc)
	}

	setDescriptionVisibility(visibility) {
		const productDescription = $('.product-description');
		const descriptionText = $('.description-section');
	
		switch (visibility) {
		  case 'show':
			productDescription.show();
			this.showDescription(descriptionText, 0);
			break;
		  case 'partial':
			productDescription.show();
			this.showDescription(descriptionText, 1);
			break;
		  case 'hide':
			productDescription.hide();
			this.addShowDescriptionButton();
			break;
		  default:
			console.error('Invalid visibility value:', visibility);
		}
	}

	showDescription(descriptionText, partial) {
		let fullDescription = this.description['es'];
		if (!partial) {
			descriptionText.html(fullDescription + ' <a href="#" class="hide-description" textId="hideDescription:1c">Ocultar descripción</a>');
			this.setupHideDescriptionListener(descriptionText);
			return;
		}
		let maxLength = 100;

		if (fullDescription.length > maxLength) {
			const partialDescription = fullDescription.substring(0, maxLength) + '... ';
			descriptionText.html(partialDescription + '<a href="#" class="show-more" textId="showMore:1c">Ver más</a>');
			this.setupShowMoreListener(descriptionText, fullDescription);
		}
	}

	setupShowMoreListener(descriptionText, fullDescription) {
		descriptionText.find('.show-more').click((e) => {
			e.preventDefault();
			descriptionText.html(fullDescription + ' <a href="#" class="hide-description" textId="hideDescription:1c">Ocultar descripción</a>');
			this.setupHideDescriptionListener(descriptionText);
		});
	}

	setupHideDescriptionListener(descriptionText) {
		descriptionText.find('.hide-description').click((e) => {
			e.preventDefault();
			this.setDescriptionVisibility('hide');
		});
	}

	addShowDescriptionButton() {
		$('.product .message-section').append('<button class="show-description" textId="showDescription:1c">Ver descripción</button>');
		this.setupShowDescriptionListener();
	}

	setupShowDescriptionListener() {
		$('.show-description').click((e) => {
			e.preventDefault();
			$('.product-description').show();
			$('.show-description').remove();
			this.showDescription($('.description-section'), 0);
		});
	}

	render() {
		$('.full-container > .product').html(`
		<div class="product-card">
			<div class="product-left">
				<div class="product-images">
					<div class="bigPhoto">
						<!-- Big Product Image -->
						<img id="bigImage" src="./img/articles/${this.images[0]}" alt="Product Image"/>
					</div>
					${this.images.length > 1
						? `<div class="thumbnails-container">
							<!-- Thumbnails Carousel -->
							<div class="thumbnails">
							${this.images.map((image, index) => `<img src="./img/articles/${image}" alt="Thumbnail" onclick="changeImage(${index})"/>`).join('')}
							</div>
						</div>`
						: ''}
				</div>
			</div>
			<div class="product-right">
				<div class="product-details">
					<div class="title">
						<span id="articleTitle" textId="${this.id}_title:1c">-article title-</span>
						${favs.getHeartHtml(this.id)}
					</div>
					<div class="price">${this.price}€</div>
					<div class="star_rating">
						${this.getStarRatingHtml()}
						<span class="score">${this.stars}/5</span>
					</div>
					${this.getVariationsHtml()}
					<div class="bottom-section">
						<div class="add-to-cart">
							<label class="title" for="quantity" textId="quantity:1c">Cantidad</label>
							<input type="number" id="quantity" value="1" min="1" name="quantity" oninput="this.value = this.value !== '' ? Math.abs(this.value) : '1'">
							<button class="positive">Añadir al carrito</button>
						</div>
						<div class="shipment-and-stock">
							<div class="${this.stock == 0 ? 'negative' : 'positive'}" textId="${this.stock === 0 ? 'noStock' : 'inStock'}:1c"></div>
							<div textId="${this.shipment == 1 ? 'fastShipment' : 'normalShipment'}:1c"></div>
						</div>
						<div class="message-section"></div>
					</div>
				</div>
			</div>
		</div>
		<div class="product-description">
			<h4 textId="descriptionTitle:1c"></h4>
			<div class="description-section" textId="${this.id}_desc">-desc-</div>
		</div>
		`);
		favs.setupFavouriteTogglerListeners();
		this.setupVaritionsListener();
		this.setupAddToCartListener();
	}
	
	setupAddToCartListener() {
		let productPage = this

		$('.add-to-cart button').click(function() {
			console.log(productPage.stock)
			if (productPage.stock === 0) {
				productPage.showOutOfStockWarning();
				return;
			}

			let variations = productPage.readSelectedVariations()
			let q = $('input[name=quantity]', $(this).parent())[0].value
			if (variations == null){
				productPage.showVariationIncompleteWarning()
				return
			}
			
			cart.add(productPage.id, q, variations)
			productPage.showProductAddedToCart(productPage.id, q, variations)
		})
	}

	setupVaritionsListener() {
		$('.full-container > .product .variation .choice').click(function() {
			let e = $(this)
			if (e.hasClass('selected')) return
			
			// Remove any selected choices in this current variation
			$('.choice.selected', e.parent()).each(function() {
				$(this).removeClass('selected')
			})

			e.addClass('selected')
		})
	}

	showVariationIncompleteWarning() {
		this.removeVariationIncompleteWarning();
		const warningHtml = `
			<div class="variation-warning-notification error-notification">
				<div class="notification-content">
					<span class="close-btn">&times;</span>
					<p textId="variationIncompleteWarning:1c">Por favor, selecciona todas las variaciones.</p>
				</div>
			</div>
		`;

		$('body').append(warningHtml);
		translateTexts(null, $('.variation-warning-notification'));

		// Add event listener to close button
		$('.variation-warning-notification .close-btn').click(function() {
			$('.variation-warning-notification').remove();
		});

		// Automatically remove the notification after 5 seconds
		setTimeout(() => {
			$('.variation-warning-notification').remove();
		}, 5000);
	}

	showOutOfStockWarning() {
		this.removeVariationIncompleteWarning();
		const warningHtml = `
			<div class="out-of-stock-notification error-notification">
				<div class="notification-content">
					<span class="close-btn">&times;</span>
					<p textId="outOfStockWarning:1c">Este producto está agotado.</p>
				</div>
			</div>
		`;

		$('body').append(warningHtml);
		translateTexts(null, $('.out-of-stock-notification'));

		// Add event listener to close button
		$('.out-of-stock-notification .close-btn').click(function() {
			$('.out-of-stock-notification').remove();
		});

		// Automatically remove the notification after 5 seconds
		setTimeout(() => {
			$('.out-of-stock-notification').remove();
		}, 5000);
	}

	showProductAddedToCart(id, q, variations) {
		this.removeVariationIncompleteWarning();
		let variationsArray = [];
		for (let v in variations) {
			let choice = check((Number)(variations[v])).isNumber() ? variations[v] : variations[v] + 'Choice';
			variationsArray.push(`<span textId="${v}Selector"></span> <span textId="${choice}"></span>`);
		}
		let variationsString = variationsArray.join(', ');

		const notificationHtml = `
			<div class="product-added-notification">
				<div class="notification-content">
					<span class="close-btn">&times;</span>
					<h4 textId="productAdded:1c">Producto añadido al carrito</h4>
					<p>
						<span>${q}x</span>
						<span textId="${id}_title:1c"></span>
						${variationsString}
					</p>
					<a href="./basket.html" class="view-cart-btn">Ver carrito</a>
				</div>
			</div>
		`;

		$('body').append(notificationHtml);
		translateTexts(null, $('.product-added-notification'));

		// Add event listener to close button
		$('.product-added-notification .close-btn').click(function() {
			$('.product-added-notification').remove();
		});

		// Automatically remove the notification after 5 seconds
		setTimeout(() => {
			$('.product-added-notification').remove();
		}, 5000);
	}

	removeVariationIncompleteWarning() {
		$('.variation-warning-notification').remove();
		$('.out-of-stock-notification').remove();
	}

	readSelectedVariations() {
		let variations = {}

		$('.full-container > .product .product-details .variation').each(function() {
			if (variations == null) return

			let name = $(this).attr('name')
			let choice = $('.choice.selected', this).first().attr('name')

			if (choice == null) {
				variations = null
				return
			}

			variations[name] = choice
		})
		return variations
	}

	getLoadedProductId() {
		return (new URL(document.location)).searchParams.get('articleId')
	}

	isFavourite() {
		return (Boolean)(Math.round(Math.random()))
	}

	getStarRatingHtml() {
		let n = Math.round(this.stars)
		let s = ''
		for (let i = 0; i<n; i++)
			s += '<svg class="star"><path xmlns="http://www.w3.org/2000/svg" d="M7.641.781l1.735 4.106 4.441.382c.308.027.433.411.199.613l-3.368 2.918 1.009 4.341c.07.302-.257.539-.522.379l-3.816-2.302-3.816 2.302c-.265.16-.591-.078-.522-.379l1.009-4.341-3.369-2.919c-.234-.202-.109-.587.199-.613l4.441-.382 1.735-4.105c.12-.286.524-.286.645 0z"></path></svg>\n'
		n = 5-n
		for (let i=0; i<n; i++)
			s += '<svg class="star empty"><path xmlns="http://www.w3.org/2000/svg" d="M7.641.781l1.735 4.106 4.441.382c.308.027.433.411.199.613l-3.368 2.918 1.009 4.341c.07.302-.257.539-.522.379l-3.816-2.302-3.816 2.302c-.265.16-.591-.078-.522-.379l1.009-4.341-3.369-2.919c-.234-.202-.109-.587.199-.613l4.441-.382 1.735-4.105c.12-.286.524-.286.645 0z"></path></svg>\n'
		return s
	}

	getVariationsHtml() {
		let html = `<!-- Variations -->`
		for (let variation in this.variations) {
			html += `<div class="variation" name="${variation}"><div class="title" textId="${variation}Selector:1c"></div>`
			for (let variationValue of this.variations[variation]) {
				if (check(variationValue).isNumber()) {
					html += `<span class="choice" name="${variationValue}">${variationValue}</span>`
				}
				else {
					html += `<span class="choice" name="${variationValue}" textId="${variationValue}Choice:1c"></span>`
				}
			}
			html += `</div>`
		}
		return html
	}
}
function changeImage(index) {
	const bigImage = document.getElementById('bigImage');
	bigImage.src = `./img/articles/${pageProduct.images[index]}`;
  }

  
const pageProduct = new ProductPage();
pageProduct.render();

translateTexts();

