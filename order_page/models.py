from project.db import DATABASE, relationship

class Order(DATABASE.Model):
    id = DATABASE.Column(DATABASE.Integer, primary_key=True)
    comment = DATABASE.Column(DATABASE.String)
    delivary_destination = DATABASE.Column(DATABASE.String)
    payment_method = DATABASE.Column(DATABASE.String)
    is_paied = DATABASE.Column(DATABASE.String)
    product_string = DATABASE.Column(DATABASE.String)

    def calc_overall_price(self):
        products = self.product_string.split('; ')[:-1]
        overall_price = 0
        for product in products:
            price = int(product.split('-')[2])
            overall_price += price
        return overall_price


# product_string = 'pruct_id-price-discount_price; ...'

