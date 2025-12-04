import flask, os
from ..decorator import admin_required
from ..models import Product, Section, DATABASE

products_images_path = os.path.abspath(__file__+'/../../static/images/products')
products_videos_path = os.path.abspath(__file__+'/../../static/videos')

@admin_required
def add_section_to_product():
    product = DATABASE.session.get(Product, int(flask.request.form.get('productId')))
    if not product:
        return flask.jsonify({"success": False, "error": "product not exist"})
    section = Section(
        title=flask.request.form.get('title'),
        section_text=flask.request.form.get('sectionText'),
        position = flask.request.form.get('position'),
        product_id = flask.request.form.get('productId')
    )
    DATABASE.session.add(section)
    DATABASE.session.commit()
    image = flask.request.files.get('image')
    video = flask.request.files.get('video')
    os.makedirs(products_videos_path, exist_ok=True)
    os.makedirs(products_images_path, exist_ok=True)
    if image:
        filename = f'{section.id}_{section.position}_image.png'
        image.save(f'{products_images_path}/{filename}')
        section.image_path = filename
    elif video:
        filename = f'{section.id}_{section.position}_video.mp4'
        video.save(f'{products_videos_path}/{filename}')
        section.video_path = filename
    DATABASE.session.commit()
    return flask.jsonify({
        "success": True,
        "section": {
            "id": section.id,
            "title": section.title,
            "section_text": section.section_text,
            "position": section.position,
            "image_path": section.image_path,
            "video_path": section.video_path
        }
    })

@admin_required
def get_section(section_id):
    section = DATABASE.session.get(Section, section_id)
    if section:
        return flask.jsonify({
            "success": True,
            "section": {
                "title": section.title,
                "section_text": section.section_text,
                "position": section.position,
                "image_path": section.image_path,
                "video_path": section.video_path
            }
        })
    return flask.jsonify({"success": False, "error": "invalid id"})

@admin_required
def delete_section():
    data = flask.request.get_json()
    section = DATABASE.session.get(Section, int(data.get("id")))
    if not section:
        return flask.jsonify({"success": False, "error": "incorrect_id"})
    image_path = section.image_path
    video_path = section.video_path
    if image_path and os.path.exists(f'{products_images_path}/{image_path}'):
        os.remove(f'{products_images_path}/{image_path}')
    if video_path and os.path.exists(f'{products_videos_path}/{video_path}'):
        os.remove(f'{products_videos_path}/{video_path}')
    DATABASE.session.delete(section)
    DATABASE.session.commit()
    return flask.jsonify({"success": True})

@admin_required
def update_section():
    data = flask.request.form
    section_id = int(data.get('id'))
    section = DATABASE.session.get(Section, section_id)
    if not section:
        return flask.jsonify({"success": False, "error": "incorrect_id"})
    section.title = data.get('title')
    section.section_text = data.get('sectionText')
    new_position = data.get('position')
    old_position = section.position
    section.position = new_position
    image = flask.request.files.get('image')
    old_image = section.image_path
    video = flask.request.files.get('video')
    print(video)
    old_video = section.video_path
    if new_position != old_position:
        if section.image_path:
            if os.path.exists(f'{products_images_path}/{old_image}'):
                os.rename(f'{products_images_path}/{old_image}', f'{products_images_path}/{section.id}_{section.position}_image.png')
                section.image_path = f'{section.id}_{section.position}_image.png'
        if section.video_path:
            if os.path.exists(f'{products_videos_path}/{old_video}'):
                os.rename(f'{products_videos_path}/{old_video}', f'{products_videos_path}/{section.id}_{section.position}_video.mp4')
                section.video_path = f'{section.id}_{section.position}_video.mp4'
    if image:
        if section.image_path:
            _remove_media(f'{products_images_path}/{old_image}')
        if section.video_path:
            _remove_media(f'{products_videos_path}/{old_video}')
        image.save(f'{products_images_path}/{section.id}_{section.position}_image.png')
        section.image_path = f'{section.id}_{section.position}_image.png'
        section.video_path = None
    if video:
        if section.video_path:
            _remove_media(f'{products_videos_path}/{old_video}')
        if section.image_path:
            _remove_media(f'{products_images_path}/{old_image}')
        video.save(f'{products_videos_path}/{section.id}_{section.position}_video.mp4')
        section.video_path = f'{section.id}_{section.position}_video.mp4'
        section.image_path = None
    DATABASE.session.commit()
    return flask.jsonify({
        "success": True,
        "section": {
            "id": section.id,
            "title": section.title,
            "section_text": section.section_text,
            "position": section.position,
            "image_path": section.image_path,
            "video_path": section.video_path
        }
    })

def _remove_media(path):
    if os.path.exists(path):
        os.remove(path)