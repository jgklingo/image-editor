import * as fs from "node:fs";
import { resourceUsage } from "node:process";
import { REPL_MODE_SLOPPY } from "node:repl";

class ImageEditor {
    public constructor() {}

    public run(args: string[]): void {
        try {
            if (args.length < 3) {
                this.usage();
                return;
            }
            
            const inputFile: string = args[0];  // these type declarations could be inferred
            const outputFile: string = args[1];
            const filter: string = args[2];

            const image: EditImage = this.read(inputFile);

            if (filter === "grayscale" || filter === "greyscale") {
                if (args.length != 3) {
                    this.usage();
                    return;
                }
                this.grayscale(image);
            }
            else if (filter === "invert") {
                if (args.length != 3) {
                    this.usage();
                    return;
                }
                this.invert(image);
            }
            else if (filter === "emboss") {
                if (args.length != 3) {
                    this.usage();
                    return;
                }
                this.emboss(image);
            }
            else if (filter === "motionblur") {
                if (args.length != 4) {
                    this.usage();
                    return;
                }

                const length: number = parseInt(args[3])

                if (isNaN(length) || length < 0) {
                    this.usage();
                    return;
                }

                this.motionblur(image, length)
            }
            else {
                this.usage();
            }

            this.write(image, outputFile);

        } catch (error) {
            if (error instanceof Error) {
                console.error(error.stack);
            } else {
                console.error("Unknown error:", error)
            }
        }
    }

    private usage(): void {
        console.log("USAGE: node ImageEditor.js <in-file> <out-file> <grayscale|invert|emboss|motionblur> {motion-blur-length}");
    }

    private motionblur(image: EditImage, length: number): void {
        if (length < 1) {
            return;
        }
        for (let x = 0; x < image.getWidth(); ++x) {
            for (let y = 0; y < image.getHeight(); ++y) {
                const curColor: Color = image.get(x, y);

                const maxX: number = Math.min(image.getWidth() - 1, x + length - 1);
                for (let i = x + 1; i < maxX; ++i) {
                    const tmpColor: Color = image.get(i, y);
                    curColor.red += tmpColor.red;
                    curColor.green += tmpColor.green;
                    curColor.blue += tmpColor.blue;
                }

                const delta: number = maxX - x + 1;
                curColor.red = Math.floor(curColor.red / delta);
                curColor.green = Math.floor(curColor.green / delta);
                curColor.blue = Math.floor(curColor.blue / delta);
            }
        }

    }

    private invert(image: EditImage): void {

    }

    private grayscale(image: EditImage): void {

    }

    private emboss(image: EditImage): void {

    }

    private read(filepath: string): EditImage {
        let image: EditImage;

        const file: string = fs.readFileSync(filepath, {encoding: "utf-8"});
        const tokens: string[] = file.split(/\s+/);
        let t: number = -1

        // Skip P3
        t += 1;

        const width: number = parseInt(tokens[++t]);
        const height: number = parseInt(tokens[++t]);

        image = new EditImage(width, height);

        // Skip max color value
        t += 1;
        
        for (let y = 0; y < height; ++y) {
            for (let x = 0; x < width; ++x) {
                const color: Color = new Color();
                color.red = parseInt(tokens[++t]);
                color.green = parseInt(tokens[++t]);
                color.blue = parseInt(tokens[++t]);
                image.set(x, y, color);
            }
        }
        return image;
    }

    private write(image: EditImage, filePath: string): void {
        let fd: number = -1
        try {
            fd = fs.openSync(filePath, 'w');
            fs.writeSync(fd, "P3\n");
            fs.writeSync(fd, `${image.getWidth()} ${image.getHeight()}\n`);
            fs.writeSync(fd, "255\n");

            for (let y = 0; y < image.getHeight(); ++y) {
                for (let x = 0; x < image.getWidth(); ++x) {
                    const color: Color = image.get(x, y);
                    fs.writeSync(fd, `${x === 0 ? "" : "   "}${color.red} ${color.green} ${color.blue}`);
                }
                fs.writeSync(fd, '\n');
            }
        } finally {
            if (fd != -1) {
                fs.closeSync(fd);
            }
        }
    }
}


class Color {  // complete?
    public red: number;
    public green: number;
    public blue: number;

    public constructor() {
        this.red = 0;
        this.green = 0;
        this.blue = 0;
    }
}


class EditImage {  // complete?
    private pixels: Color[][];

    public constructor(width: number, height: number) {  // asked AI for example constructors
        this.pixels = Array.from({ length: width }, () => 
            Array.from({ length: height }, () => new Color())
        );
    }

    public getWidth(): number {
        return this.pixels.length;
    }

    public getHeight(): number {
        return this.pixels[0].length;
    }

    public set(x: number, y: number, c: Color): void {
        this.pixels[x][y] = c;
    }

    public get(x: number, y: number): Color {
        return this.pixels[x][y];
    }
}


new ImageEditor().run(process.argv.slice(2))
