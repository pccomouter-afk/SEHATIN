const Toast = {
  ensureStack() {
    let stack = document.querySelector(".toast-stack");
    if (!stack) {
      stack = document.createElement("div");
      stack.className = "toast-stack";
      document.body.appendChild(stack);
    }
    return stack;
  },
  show(message, type) {
    const stack = this.ensureStack();
    const toast = document.createElement("div");
    toast.className = "toast" + (type === "error" ? " toast-error" : "");
    const icon = type === "error" ? "fa-circle-exclamation" : "fa-circle-check";
    toast.innerHTML = '<i class="fa-solid ' + icon + '"></i><span></span>';
    toast.querySelector("span").textContent = message;
    stack.appendChild(toast);
    setTimeout(function () {
      toast.classList.add("is-leaving");
      setTimeout(function () {
        toast.remove();
      }, 200);
    }, 3200);
  },
  success(message) {
    this.show(message, "success");
  },
  error(message) {
    this.show(message, "error");
  },
};

window.Toast = Toast;
