

function u() {
  return {
    single: (name) => {
      return function (body) {
        console.log("Params from single:", name);
        console.log("Request body:", body);
      };
    },
  };
}

const t = u();

function pls(condition, cb) {
  if (condition === "true") {
    cb("my body");
  }
};
 
pls("true", t.single("henry"));
