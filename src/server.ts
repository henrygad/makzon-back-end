import app from "./app";

const firstFunction = (params: string) => {
    console.log(params + " " + "from firstFunction");
};

firstFunction("Hello World");

app("Hello World");