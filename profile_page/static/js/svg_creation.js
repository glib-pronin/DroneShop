function createTruckSVG(statusCode) {
  const svgNS = "http://www.w3.org/2000/svg";
  const xlinkNS = "http://www.w3.org/1999/xlink";

  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("class", "truck");
  svg.setAttribute("width", "32");
  svg.setAttribute("height", "32");
  svg.setAttribute("viewBox", "0 0 32 32");
  svg.setAttribute("fill", "none");

  if (statusCode === "5") {
    svg.setAttribute("xmlns:xlink", xlinkNS);
    const circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("cx", "16");
    circle.setAttribute("cy", "16");
    circle.setAttribute("r", "10");
    circle.setAttribute("fill", "white");

    const rect = document.createElementNS(svgNS, "rect");
    rect.setAttribute("width", "32");
    rect.setAttribute("height", "32");
    rect.setAttribute("fill", "url(#pattern0_1107_4001)");
    
    const defs = document.createElementNS(svgNS, "defs");

    const image = document.createElementNS(svgNS, "image");
    image.setAttribute("id", "image0_1107_4001");
    image.setAttribute("width", "90");
    image.setAttribute("height", "90");
    image.setAttribute("preserveAspectRatio", "none");
    image.setAttributeNS(xlinkNS, "xlink:href", "data:image/png;base64,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");
    
    const pattern = document.createElementNS(svgNS, "pattern");
    pattern.setAttribute("id", "pattern0_1107_4001");
    pattern.setAttribute("patternContentUnits", "objectBoundingBox");
    pattern.setAttribute("width", "1");
    pattern.setAttribute("height", "1");

    const use = document.createElementNS(svgNS, "use");
    use.setAttributeNS(xlinkNS, "xlink:href", "#image0_1107_4001");
    use.setAttribute("transform", "scale(0.0111111)");

    pattern.appendChild(use);


    defs.appendChild(image);
    defs.appendChild(pattern);

    svg.appendChild(circle);
    svg.appendChild(rect);
    svg.appendChild(defs);
  } 
  else {
    const rectOuter = document.createElementNS(svgNS, "rect");
    rectOuter.setAttribute("x", "0.5");
    rectOuter.setAttribute("y", "0.5");
    rectOuter.setAttribute("width", "31");
    rectOuter.setAttribute("height", "31");
    rectOuter.setAttribute("rx", "15.5");
    rectOuter.setAttribute("fill", "white");

    const rectBorder = document.createElementNS(svgNS, "rect");
    rectBorder.setAttribute("x", "0.5");
    rectBorder.setAttribute("y", "0.5");
    rectBorder.setAttribute("width", "31");
    rectBorder.setAttribute("height", "31");
    rectBorder.setAttribute("rx", "15.5");
    rectBorder.setAttribute("stroke", "#0C122A");

    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("fill-rule", "evenodd");
    path.setAttribute("clip-rule", "evenodd");
    path.setAttribute("d", "M19.0693 15.7801H24.3265V14.8958L21.6979 12.2489H19.0692L19.0693 15.7801ZM19.0693 11.3663H22.1986L25.2027 14.3087V19.3109C25.2027 19.7984 24.8105 20.1937 24.3266 20.1937H23.0122C23.0122 21.4124 22.0316 22.4006 20.8218 22.4006C19.6121 22.4006 18.6313 21.4124 18.6313 20.1937H12.4979C12.4979 21.4124 11.5173 22.4006 10.3074 22.4006C9.0977 22.4006 8.11691 21.4124 8.11691 20.1937H7.67885C7.19495 20.1937 6.80273 19.7984 6.80273 19.3109V10.4833C6.80273 9.99574 7.19495 9.60059 7.67885 9.60059H18.1932C18.6771 9.60059 19.0693 9.99574 19.0693 10.4833V11.3663ZM10.3074 21.518C11.0333 21.518 11.6217 20.9252 11.6217 20.1939C11.6217 19.4625 11.0333 18.8697 10.3074 18.8697C9.58157 18.8697 8.99315 19.4625 8.99315 20.1939C8.99315 20.9252 9.58157 21.518 10.3074 21.518ZM20.8217 21.518C21.5477 21.518 22.1361 20.9252 22.1361 20.1939C22.1361 19.4625 21.5477 18.8697 20.8217 18.8697C20.0959 18.8697 19.5075 19.4625 19.5075 20.1939C19.5075 20.9252 20.0959 21.518 20.8217 21.518Z");
    path.setAttribute("fill", "#0C122A");

    svg.appendChild(rectOuter);
    svg.appendChild(rectBorder);
    svg.appendChild(path);
  }
  return svg;
}


