from project.db import DATABASE, select, and_, relationship

class Product(DATABASE.Model):
    id = DATABASE.Column(DATABASE.Integer, primary_key=True)
    name = DATABASE.Column(DATABASE.String)
    price = DATABASE.Column(DATABASE.Integer)
    discount = DATABASE.Column(DATABASE.Float)
    summary = DATABASE.Column(DATABASE.String)
    type = DATABASE.Column(DATABASE.String, default='drone')

    sections = relationship('Section', back_populates='product', cascade='all, delete-orphan')

    def get_path(self):
        return f'images/products/{self.id}_{self.name.replace(" ", "_")}.png'
     
    def get_discounted_price(self):
        return round(self.price * (100-self.discount) / 100) 

class Section(DATABASE.Model):
    id = DATABASE.Column(DATABASE.Integer, primary_key=True)
    title = DATABASE.Column(DATABASE.String)
    section_text = DATABASE.Column(DATABASE.String)
    position = DATABASE.Column(DATABASE.String)
    image_path = DATABASE.Column(DATABASE.String, nullable=True)
    video_path = DATABASE.Column(DATABASE.String, nullable=True)
    product_id = DATABASE.Column(DATABASE.Integer, DATABASE.ForeignKey('product.id'))

    product = relationship('Product', back_populates='sections')


    # def get_video_path(self):
    #     return f'videos/{self.id}_{self.position}_video.mp4'
    
    # def get_video_path(self):
    #     return f'images/products/{self.id}_{self.position}_image.png'
    
