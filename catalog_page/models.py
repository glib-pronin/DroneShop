from project.db import DATABASE

class Product(DATABASE.Model):
    id = DATABASE.Column(DATABASE.Integer, primary_key=True)
    name = DATABASE.Column(DATABASE.String)
    price = DATABASE.Column(DATABASE.Integer)
    discount = DATABASE.Column(DATABASE.Float)
    summary = DATABASE.Column(DATABASE.String)
    html_description = DATABASE.Column(DATABASE.String)

    def get_path(self):
        return f'images/products/{self.id}_{self.name.replace(" ", "_")}.png'
     
    def get_discounted_price(self):
        return round(self.price * (100-self.discount) / 100) 

    
