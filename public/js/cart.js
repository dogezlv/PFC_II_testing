class CartController {
	constructor() {
		this.articleList = $('#articleList')
		this.basketSummary = $('#basketSummary')
		this.total = 0
	}

	render() {
		if (Object.keys(cart.data).length == 0) {
			this.renderEmptyBasket();
			document.getElementById("articleList").style.display = "none";
			document.getElementById("basketSummary").style.display = "none";
			document.getElementById("userData").style.display = "none";
		} else {
			document.getElementById("articleList").style.display = "block";
			document.getElementById("basketSummary").style.display = "block";
			document.getElementById("userData").style.display = "block";
			this.renderArticleList();
			this.renderBasketSummary();
		}
	}

	renderEmptyBasket() {
		let html = `
		    <div style="text-align: left; margin: 20px 0;">
        <span textId="emptyCart:1c" style="font-size: 18px; font-weight: bold;"></span>
    </div>
	<div style="text-align: left; margin: 20px 0;">
			<a href="order.html?action=list" style="color: #007bff; text-decoration: none; font-size: 16px;">
				Mis pedidos
			</a>
		</div>
		`
		this.articleList.before(html)
	}

	renderArticleList() {
		this.total = 0
		let html = `
					<div class="headers">
				<span></span>
				<span textId="product:1c"></span>
				<span textId="unitPrice:1c"></span>
				<span textId="quantity:1c"></span>
				<span textId="amount:1c"></span>
			</div>`

		let line = 0
		for (let article of cart.data) {
			// Ensure article id in cart exists
			if (!check(articlesData).has(article.id)) continue

			// Static data of the article
			let data = articlesData[article.id]

			let amount = data.price * article.quantity
			this.total += amount

			html += `
			<div class="article" name="${line++}">
				<img src="./img/articles/${data.images[0]}" />
				<div class="article-details">
					<span textid="${article.id}_title" class="article-title"></span>
					<div class="variationsText">${this.articleVariationsAsHtml(article)}</div>
				</div>
				<span class="unit-price">${data.price.toFixed(2)}€</span>
				<div class="articleQuantity">
					<div class="quantity-controls">
						<button class="minus">-</button>
						<input type="number" value="${article.quantity}" min="1" name="quantity" oninput="this.value = !!this.value && Math.abs(this.value) >= 0 ? Math.abs(this.value) : null">
						<button class="plus">+</button>
					</div>
					<button class="remove" textId="remove:1c"></button>
				</div>
				<span class="amount">${amount.toFixed(2)}€</span>
			</div>`
		}

		this.articleList.html(html)
		this.setupArticleListListeners()
	}

	articleVariationsAsHtml(article) {
		let variationsStrings = []
		for (let v in article.variations) {
			let s = ''
			let val = article.variations[v]

			s += `<span textId="${v}Selector"></span> `
			if (check((Number)(val)).isNumber())
				s += `<span>${article.variations[v]}</span>`
			else
				s += `<span textId="${article.variations[v]}Choice"></span>`
			variationsStrings.push(s)
		}
		return variationsStrings.join(', ')
	}

	renderBasketSummary() {
		let basketHtml = `
			<div id="moneySummary">
				<div id="totalMoneyStep1">
					<div>Total artículos (IVA inc.)</div>
					<div>${this.total.toFixed(2)}€</div>
				</div>
				<div id="shipment">
					<div>Envío y preparación</div>
					<div>6.00€</div>
				</div>
				<div id="taxes">
					<div>Impuestos (21%)</div>
					<div>${(((this.total + 6) / 1.21) * 0.21).toFixed(2)}€</div>
				</div>
				<div id="totalMoneyStep2">
					<div>Total (IVA inc.)</div>
					<div>${(this.total + 6).toFixed(2)}€</div>
				</div>
				<div class="confirmPurchase">
					<a href="order.html?action=create">
						<button id="confirmPurchaseBtn" textId="confirmPurchase:1c" class="positive"></button>
					</a>
				</div>
			</div>`;

		this.basketSummary.html(basketHtml);
	}

	setupArticleListListeners() {
		// Subtract buttons
		$('#articleList .articleQuantity .minus').click(function () {
			let input = $('input[type=number]', $(this).parent())[0]
			let value = input.valueAsNumber
			if (value >= 2) {
				input.value = value - 1
				$(input).trigger('change')
			}
		})

		// Add buttons
		$('#articleList .articleQuantity .plus').click(function () {
			let input = $('input[type=number]', $(this).parent())[0]
			let value = input.valueAsNumber
			input.value = value + 1
			$(input).trigger('change')
		})

		// input[type=number] on change
		$('#articleList .articleQuantity input[type=number]').on('change', function () {
			let value = this.valueAsNumber
			if (!value || value < 1) {
				this.value = 1
				value = 1
			}
			let line = (Number)($(this).parent().parent().parent().attr('name'))
			cart.setQ(line, value)
			cartController.render()
			translateTexts()
		})

		// Remove button listeners
		$('#articleList .articleQuantity .remove').click(function () {
			let line = (Number)($(this).parent().parent().attr('name'))
			cart.delLine(line)
			cartController.render()
			translateTexts()
		})
	}
}


let cartController = new CartController()
cartController.render()

let pc = new ProfileController()
pc.render_cart()

translateTexts()