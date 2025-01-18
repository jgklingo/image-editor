#!/usr/bin/bash

filters=("emboss" "grayscale" "invert")

input_dir="project-files/source_images"
output_dir="project-files/my_images"

mkdir -p "$output_dir"

for file in "$input_dir"/*; do
    for filter in "${filters[@]}"; do
        filename=$(basename "$file")
        output_file="$output_dir/${filter}-${filename}"
        node dist/ImageEditor.js "$file" "$output_file" "$filter"
    output_file="$output_dir/motionblur-${filename}"
    node dist/ImageEditor.js "$file" "$output_file" motionblur 10
    done
done