window.shake = e => {
    if (!(e instanceof HTMLElement))
        return console.log("not a shakeable element!");
    e.classList.add("shake");
    setTimeout(() => e.classList.remove("shake"), 1500);
}