export const format = (node: any, formatFunction: any) => {
    function updateValue(e: any) {
        console.log("UPDATE: ");
        console.log(node.value);
        node.value = formatFunction(node.value);
    }

    node.addEventListener('input', updateValue);
    node.addEventListener('paste', updateValue);
    node.addEventListener('change', updateValue);

    // Format on intial hydration
    node.value = formatFunction(node.value);

    return {
        destroy() {
            node.removeEventListener('input', updateValue);
            node.removeEventListener('paste', updateValue);
            node.removeEventListener('change', updateValue);
        }
    }

}