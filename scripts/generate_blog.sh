STATIC_BLOGS_DIRECTORY="static/blogs"
NEW_BLOG="new_blog.md"
NEW_BLOG_FOLDER="$STATIC_BLOGS_DIRECTORY/new_blog"


# Create new blog folder
mkdir -p $NEW_BLOG_FOLDER
touch $NEW_BLOG_FOLDER/$NEW_BLOG

# add basic content to the new blog file
cat <<EOF > $NEW_BLOG_FOLDER/$NEW_BLOG
---
title: New Blog Title
created_on: $(date +%Y-%m-%d)
description: This is my new blog
tags: ['blog', 'new_blog']
posterImage: /images/catt-kitten.webp
authors: ['ganesht049@gmail.com']
---


![Cute Kitten](/images/catt-kitten.webp)


### I am a new blog header update me accordingly

EOF 
