//declarations
const headerEl = document.querySelector(".header");
const headercontEl = document.querySelector(".header-content");
const dropMenu = document.getElementById("drop-menu");
const getInfoBtn = document.querySelector(".info-Btn");
const formInputEl = document.querySelector(".form-input");
const popupMain = document.querySelector(".popup");
const buttons = document.querySelectorAll(".popup-button");
const popupText = document.querySelector(".popup-inner p");
const dropmenuTooltip = document.querySelector(".dropmenu-container .tooltip");
const infoListEl = document.querySelector(".info-list");

//Event listeners

window.addEventListener("scroll", fixNav);
window.addEventListener("DOMContentLoaded", disabledDropMenu);

getInfoBtn.addEventListener("click", async () => {
  infoListEl.innerHTML = "";
  await getData();
  checkTooltipVisibility();
  changeRadioBg();
  const accordionContent1 = document.querySelectorAll(".b-inner1-cont");
  const accordionContent2 = document.querySelectorAll(".b-inner2-cont");
  accordionFuntion(accordionContent1);
  accordionFuntion(accordionContent2);
});

document.addEventListener("DOMContentLoaded", popupBtn);
document.addEventListener("DOMContentLoaded", checkTooltipVisibility);

//functions

let hasRetrievedData = false;
async function getData() {
  let formValue = formInputEl.value.toUpperCase();

  if (formValue === "") {
    formInputEl.classList.add("noValue-Error");
    infoListEl.innerHTML = "";
    disabledDropMenu();
    addFirstOption();
    hasRetrievedData = false;
    return;
  } else {
    formInputEl.classList.remove("noValue-Error");
  }

  try {
    hasRetrievedData = true;

    const response = await fetch(
      `https://nodejs-serverless-function-express-xi-ecru.vercel.app/api/events.mjs?countryCode=${formValue}`
    );

    //handle no event
    if (response.status === 404) {
      popupMain.classList.add("is-active");
      document.documentElement.classList.add("no-scroll");
      popupText.innerHTML = `There are currently no events listed for ${formValue}. Try a different country code.`;
      addFirstOption();
      disabledDropMenu();
      infoListEl.innerHTML = "";
      return;
    }

    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }

    const data = await response.json();

    displayEvents(data);
  } catch (error) {
    hasRetrievedData = false;
    console.error("Error fetching event:", error);
  } finally {
    formInputEl.value = "";
    checkTooltipVisibility();
  }
}

//display data
let dropmenuArr = [];

function displayEvents(data) {
  let events = data._embedded.events;
  const names = [];
  const dropmenuSegments = [];

  events.forEach((event) => {
    if (!names.includes(event.name)) {
      const promoterName = event.promoter ? event.promoter.name : "Unknown";

      const timezoneEl = event.dates ? event.dates.timezone : "Unkown";

      const localDate = event.dates ? event.dates.start.localDate : "unknow";

      const localTime = event.dates.start.localTime
        ? event.dates.start.localTime
        : "Time Be Announced!";

      const awareness = event.info ? event.info : "no info";

      const getTicket = event.url ? event.url : "no link provided";
      const pSaleDate = event.sales;

      const startTime = pSaleDate.public.startDateTime
        ? pSaleDate.public.startDateTime
        : "no Starting time given";

      const startTimeFinal =
        startTime !== "no Starting time given"
          ? startTime.split("T").join(" - ")
          : "no Starting time given";

      const endTime = pSaleDate.public.endDateTime
        ? pSaleDate.public.endDateTime
        : "no ending time given";

      const endTimeFinal =
        endTime !== "no ending time given"
          ? endTime.split("T").join(" - ")
          : "no ending time given";

      const minMaxRange = event.priceRanges
        ? `$${event.priceRanges[0].min}-$${event.priceRanges[0].max}`
        : "unknown";

      let presaleData = "No presale information available";
      if (Array.isArray(pSaleDate.presales)) {
        presaleData = pSaleDate.presales.map((presale) => {
          return {
            presaleName: presale.name,
            preEndTime: presale.endDateTime,
            preStartTime: presale.startDateTime,
          };
        });
      } else if (typeof pSaleDate.presales === "string") {
        presaleData = event.presales;
      }

      const ticketStatus = event.dates ? event.dates.status.code : "no info";

      const seatmapUrl = event.seatmap ? event.seatmap.staticUrl : "none";

      const venues = event._embedded.venues
        ? event._embedded.venues
        : "no venues";

      const parkingDetails = venues[0].parkingDetail
        ? venues[0].parkingDetail
        : "no parking info";

      const officeInfo = venues[0].boxOfficeInfo
        ? venues[0].boxOfficeInfo
        : "no office info provided";

      const generalInfo = venues[0].generalInfo
        ? venues[0].generalInfo
        : "no general Info";

      const Images = event.images[0].url
        ? event.images[0].url
        : "no image provided";

      const venuLast = venues.map((data) => {
        if (data.state) {
          return {
            name: data.name,
            address: data.address.line1,
            city: data.city.name,
            statecode: data.state.stateCode,
            postalcode: data.postalCode,
            parkingDetail: parkingDetails,
          };
        } else if (!data.state) {
          return {
            name: data.name ? data.name : "no name",
            address: data.address ? data.address.line1 : "no address",
            city: data.city.name,
            postalcode: data.postalCode ? data.postalCode : "no postalCode",
            parkingDetail: parkingDetails,
            countryCode: data.country.countryCode,
            countryname: data.country.name,
          };
        }
      });

      const segments = event.classifications
        ? event.classifications[0].segment.name
        : "no segment";

      dropmenuSegments.push(segments);

      //pushing to names
      names.push({
        name: event.name,
        promoter: promoterName,
        timezone: timezoneEl,
        localDate: localDate,
        localTime: localTime,
        minMaxRange: minMaxRange,
        info: awareness,
        url: getTicket,
        publicSalesStart: startTimeFinal,
        publicSalesEnd: endTimeFinal,
        presales: presaleData,
        ticketSaleStatus: ticketStatus,
        seatmapUrl: seatmapUrl,
        venues: venuLast,
        officeInfo: officeInfo,
        generalInfo: generalInfo,
        image: Images,
        segment: segments,
      });
    }
  });

  //push dropmenu segments
  const dropmenuArr = [...new Set(dropmenuSegments)];

  addDropMenuValues(dropmenuArr);
  enabledDropMenu();

  names.forEach((name, index) => {
    const container = CreateContainer(name, index);
  });

  dropMenu.addEventListener("change", (e) => {
    filterContainers(dropmenuArr, e);
  });
}

function filterContainers(dropmenuArr, e) {
  //
  const option = [];
  let elDatasetValue;
  const infoListElements = Array.from(infoListEl.children);

  infoListElements.forEach((element) => {
    elDatasetValue = element.dataset.optionValue;
    if (e.target.value === elDatasetValue || e.target.value === "all") {
      option.push(element);
      element.style.display = "block";
    } else {
      element.style.display = "none";
    }
  });
}

function CreateContainer(name, index) {
  //info container
  const infoContainer = document.createElement("div");
  infoContainer.classList.add("info-container");
  infoContainer.dataset.optionValue = name.segment.toLowerCase();

  //info-top
  const infoTop = document.createElement("div");
  infoTop.classList.add("info-top", "main");

  //info-top-inner
  const infoTopInner = document.createElement("div");
  infoTopInner.classList.add("info-top-inner");

  //info-top-inner radio inputs
  const topInnerRadio1 = createRadioInput(
    `top-radio1-${index}`,
    `top-name-${index}`
  );
  const topInnerRadio2 = createRadioInput(
    `top-radio2-${index}`,
    `top-name-${index}`
  );

  //top-inner1
  const topInner1 = document.createElement("div");
  topInner1.classList.add("top-inner1", "first");

  //top-inner1-cont1
  const topInner1Cont1 = document.createElement("div");
  topInner1Cont1.classList.add("top-inner1-cont1");

  //event name
  const eventNameH1 = document.createElement("h1");
  eventNameH1.innerText = name.name;

  //promoter div
  const promoterDiv = document.createElement("div");
  promoterDiv.classList.add("inner1-cont1-div1");

  const promoterH3 = document.createElement("h3");
  promoterH3.innerText = "Promoter:";

  const promoterP = document.createElement("p");
  promoterP.innerText = name.promoter;

  promoterDiv.appendChild(promoterH3);
  promoterDiv.appendChild(promoterP);

  topInner1Cont1.appendChild(eventNameH1);
  topInner1Cont1.appendChild(promoterDiv);

  //top-inner1-cont2
  const topInner1Cont2 = document.createElement("div");
  topInner1Cont2.classList.add("top-inner1-cont2");

  const eventImage = addImage(name);
  topInner1Cont2.appendChild(eventImage);

  //top-inner2
  const topInner2 = document.createElement("div");
  topInner2.classList.add("top-inner2");

  //top-inner2-cont1
  const topInner2Cont1 = document.createElement("div");
  topInner2Cont1.classList.add("top-inner2-cont1");

  const statusTitleP = document.createElement("p");
  statusTitleP.innerText = "Status:";
  statusTitleP.classList.add("ps");

  const statusMainP = addStatusMain(name);

  //color1
  topInner2Cont1.appendChild(statusTitleP);
  topInner2Cont1.appendChild(statusMainP);

  //top-inner2-cont2
  const topInner2Cont2 = document.createElement("div");
  topInner2Cont2.classList.add("top-inner2-cont2");

  const inner2Cont2Div1 = document.createElement("div");
  inner2Cont2Div1.classList.add("inner2-cont2-div1");

  const priceLabel = document.createElement("p");
  priceLabel.classList.add("pricelabel");
  priceLabel.innerText = "Price Range:";

  const priceRange = document.createElement("p");
  priceRange.classList.add("pricerange");
  priceRange.innerText = name.minMaxRange;

  inner2Cont2Div1.appendChild(priceLabel);
  inner2Cont2Div1.appendChild(priceRange);

  const inner2Cont2Div2 = document.createElement("div");
  inner2Cont2Div2.classList.add("inner2-cont2-div2");

  const addressLabel = document.createElement("p");
  addressLabel.classList.add("addresslabel");
  addressLabel.innerText = "Address:";

  const addressMain = addAddress(name);

  inner2Cont2Div2.appendChild(addressLabel);
  inner2Cont2Div2.appendChild(addressMain);

  topInner2Cont2.appendChild(inner2Cont2Div1);
  topInner2Cont2.appendChild(inner2Cont2Div2);

  //top inner appends
  infoTopInner.appendChild(topInnerRadio1);
  infoTopInner.appendChild(topInnerRadio2);

  infoTopInner.appendChild(topInner1);
  infoTopInner.appendChild(topInner2);

  topInner1.appendChild(topInner1Cont1);
  topInner1.appendChild(topInner1Cont2);

  topInner2.appendChild(topInner2Cont1);
  topInner2.appendChild(topInner2Cont2);

  //top manual labels
  const topLabel1 = createLabel(`top-radio1-${index}`);
  const topLabel2 = createLabel(`top-radio2-${index}`);

  //manual div
  const manualLabelsDiv = document.createElement("div");
  manualLabelsDiv.classList.add("manual-nav");
  manualLabelsDiv.appendChild(topLabel1);
  manualLabelsDiv.appendChild(topLabel2);

  infoTop.appendChild(infoTopInner);
  infoTop.appendChild(manualLabelsDiv);

  //info-middle
  const infoMiddle = document.createElement("div");
  infoMiddle.classList.add("info-middle", "main");

  //info-middle-inner
  const infoMiddleInner = document.createElement("div");
  infoMiddleInner.classList.add("info-middle-inner");

  // info-middle-inner radio inputs
  const middleInnerRadio1 = createRadioInput(
    `middle-radio1-${index}`,
    `middle-name-${index}`
  );
  const middleInnerRadio2 = createRadioInput(
    `middle-radio2-${index}`,
    `middle-name-${index}`
  );

  //middle-inner1
  const middleInner1 = document.createElement("div");
  middleInner1.classList.add("middle-inner1", "first");

  const middleDateContainer = document.createElement("div");
  middleDateContainer.classList.add("m-inner1-dateCont");

  const dateLabel = document.createElement("p");
  dateLabel.innerText = "Date:";

  const dateMain = document.createElement("p");
  dateMain.innerText = name.localDate;

  middleDateContainer.appendChild(dateLabel);
  middleDateContainer.appendChild(dateMain);

  const middleTimeContainer = document.createElement("div");
  middleTimeContainer.classList.add("m-inner1-timeCont");

  const timeLabel = document.createElement("p");
  timeLabel.innerText = "Time:";

  const timeMain = document.createElement("p");
  timeMain.innerText = `${name.localTime} ${name.timezone} TimeZone`;

  middleTimeContainer.appendChild(timeLabel);
  middleTimeContainer.appendChild(timeMain);

  const ticketLink = document.createElement("a");
  ticketLink.classList.add("m-inner1-link");
  ticketLink.href = name.url;
  ticketLink.target = "_blank";
  ticketLink.textDecoration = "none";

  const ticketText = document.createElement("p");
  ticketText.classList.add("innner-link-p");
  ticketText.innerText = name.url;

  ticketLink.appendChild(ticketText);

  const publicSaleContainer = document.createElement("div");
  publicSaleContainer.classList.add("m-inner1-pSalesCont");

  const publicSaleLabel = document.createElement("p");
  publicSaleLabel.classList.add("psales-label");
  publicSaleLabel.innerText = "Public Sales";

  const publicSaleStart = document.createElement("p");
  publicSaleStart.classList.add("start-p");

  const publicStartSpan = document.createElement("span");
  publicStartSpan.classList.add("start-span");
  publicStartSpan.innerText = name.publicSalesStart;

  publicSaleStart.append("Starts:", publicStartSpan);

  const publicSaleEnd = document.createElement("p");
  publicSaleEnd.classList.add("end-p");

  const publicEndSpan = document.createElement("span");
  publicEndSpan.classList.add("end-span");
  publicEndSpan.innerText = name.publicSalesEnd;

  publicSaleEnd.append("Ends:", publicEndSpan);

  publicSaleContainer.appendChild(publicSaleLabel);
  publicSaleContainer.appendChild(publicSaleStart);
  publicSaleContainer.appendChild(publicSaleEnd);

  middleInner1.appendChild(middleDateContainer);
  middleInner1.appendChild(middleTimeContainer);
  middleInner1.appendChild(ticketLink);
  middleInner1.appendChild(publicSaleContainer);

  //middle-inner2
  const middleInner2 = document.createElement("div");
  middleInner2.classList.add("middle-inner2");

  //presale content
  const presaleContent = presale(name);
  middleInner2.appendChild(presaleContent);

  //middle inner appends
  infoMiddleInner.appendChild(middleInnerRadio1);
  infoMiddleInner.appendChild(middleInnerRadio2);
  infoMiddleInner.appendChild(middleInner1);
  infoMiddleInner.appendChild(middleInner2);

  // middle manual labels
  const middleLabel1 = createLabel(`middle-radio1-${index}`);
  const middleLabel2 = createLabel(`middle-radio2-${index}`);

  const middleLabelsDiv = document.createElement("div");
  middleLabelsDiv.classList.add("manual-nav");

  middleLabelsDiv.appendChild(middleLabel1);
  middleLabelsDiv.appendChild(middleLabel2);

  infoMiddle.appendChild(infoMiddleInner);
  infoMiddle.appendChild(middleLabelsDiv);

  //info-bottom
  const infoBottom = document.createElement("div");
  infoBottom.classList.add("info-bottom", "main");

  //info-bottom-inner
  const infoBottomInner = document.createElement("div");
  infoBottomInner.classList.add("info-bottom-inner");

  //bottom-inner1
  const bottomInner1 = document.createElement("div");
  bottomInner1.classList.add("bottom-inner1", "first");

  //b-inner1-cont
  const bottomInner1FirstCont = document.createElement("div");
  bottomInner1FirstCont.classList.add("b-inner1-cont");

  const eventHeader = document.createElement("header");

  const eventTitle = document.createElement("p");
  eventTitle.classList.add("title");
  eventTitle.innerText = "Events Guideline";

  const eventIcon = document.createElement("i");
  eventIcon.classList.add("ri-add-circle-fill");

  eventHeader.appendChild(eventTitle);
  eventHeader.appendChild(eventIcon);

  const eventInfo1 = document.createElement("p");
  eventInfo1.classList.add("information");
  eventInfo1.innerText = name.info;

  bottomInner1FirstCont.appendChild(eventHeader);
  bottomInner1FirstCont.appendChild(eventInfo1);

  //b-inner1-cont second
  const bottomInner1SecondCont = document.createElement("div");
  bottomInner1SecondCont.classList.add("b-inner1-cont", "second");

  const officeHeader = document.createElement("header");

  const officeTitle = document.createElement("p");
  officeTitle.classList.add("title");
  officeTitle.innerText = "Office Details";

  const officeIcon = document.createElement("i");
  officeIcon.classList.add("ri-add-circle-fill");

  officeHeader.appendChild(officeTitle);
  officeHeader.appendChild(officeIcon);

  const officeInfo = document.createElement("div");
  officeInfo.classList.add("information2");

  const officeInfoUl = addOffice(name);
  officeInfo.appendChild(officeInfoUl);

  bottomInner1SecondCont.appendChild(officeHeader);
  bottomInner1SecondCont.appendChild(officeInfo);

  bottomInner1.appendChild(bottomInner1FirstCont);
  bottomInner1.appendChild(bottomInner1SecondCont);

  //bottom-inner2
  const bottomInner2 = document.createElement("div");
  bottomInner2.classList.add("bottom-inner2");

  //b-inner2-cont
  const bottomInner2FirstCont = document.createElement("div");
  bottomInner2FirstCont.classList.add("b-inner2-cont");

  const parkingHeader = document.createElement("header");

  const parkingTitle = document.createElement("p");
  parkingTitle.classList.add("title");
  parkingTitle.innerText = "Parking Detail";

  const parkingIcon = document.createElement("i");
  parkingIcon.classList.add("ri-add-circle-fill");

  parkingHeader.appendChild(parkingTitle);
  parkingHeader.appendChild(parkingIcon);

  const parkingInfo = document.createElement("p");
  parkingInfo.classList.add("information");
  parkingInfo.innerText = name.venues[0].parkingDetail;

  bottomInner2FirstCont.appendChild(parkingHeader);
  bottomInner2FirstCont.appendChild(parkingInfo);

  //b-inner2-cont second
  const bottomInner2SecondCont = document.createElement("div");
  bottomInner2SecondCont.classList.add("b-inner2-cont", "second");

  const generalInfoHeader = document.createElement("header");

  const gInfoTitle = document.createElement("p");
  gInfoTitle.classList.add("title");
  gInfoTitle.innerText = "General Info";

  const gInfoIcon = document.createElement("i");
  gInfoIcon.classList.add("ri-add-circle-fill");

  generalInfoHeader.appendChild(gInfoTitle);
  generalInfoHeader.appendChild(gInfoIcon);

  const generalInfo = document.createElement("div");
  generalInfo.classList.add("information2");

  const generalInfoUl = addGeneralInfo(name);

  generalInfo.appendChild(generalInfoUl);

  bottomInner2SecondCont.appendChild(generalInfoHeader);
  bottomInner2SecondCont.appendChild(generalInfo);

  bottomInner2.appendChild(bottomInner2FirstCont);
  bottomInner2.appendChild(bottomInner2SecondCont);

  //info-bottom-inner radio inputs
  const bottomInnerRadio1 = createRadioInput(
    `bottom-radio1-${index}`,
    `bottom-name-${index}`
  );
  const bottomInnerRadio2 = createRadioInput(
    `bottom-radio2-${index}`,
    `bottom-name-${index}`
  );

  //bottom inner appends
  infoBottomInner.appendChild(bottomInnerRadio1);
  infoBottomInner.appendChild(bottomInnerRadio2);

  infoBottomInner.appendChild(bottomInner1);
  infoBottomInner.appendChild(bottomInner2);

  // bottom manual labels
  const bottomLabel1 = createLabel(`bottom-radio1-${index}`);
  const bottomLabel2 = createLabel(`bottom-radio2-${index}`);

  const bottomLabelsDiv = document.createElement("div");
  bottomLabelsDiv.classList.add("manual-nav");

  bottomLabelsDiv.appendChild(bottomLabel1);
  bottomLabelsDiv.appendChild(bottomLabel2);

  infoBottom.appendChild(infoBottomInner);
  infoBottom.appendChild(bottomLabelsDiv);

  //appends
  infoContainer.appendChild(infoTop);
  infoContainer.appendChild(infoMiddle);
  infoContainer.appendChild(infoBottom);
  infoListEl.appendChild(infoContainer);
}

function createRadioInput(id, name) {
  const input = document.createElement("input");
  input.type = "radio";
  input.id = id;
  input.name = name;
  input.classList.add("radioBtn");
  return input;
}

function createLabel(forAttribute) {
  const label = document.createElement("label");
  label.htmlFor = forAttribute;
  label.classList.add("manual-btn");
  return label;
}

function addStatusMain(name) {
  const statusMainP = document.createElement("p");
  const statusMainIcon = document.createElement("i");
  statusMainIcon.classList.add("ri-circle-line");

  if (name.ticketSaleStatus === "rescheduled") {
    statusMainIcon.style.backgroundColor = "yellow";
  } else if (name.ticketSaleStatus === "onsale") {
    statusMainIcon.style.backgroundColor = "green";
  } else if (name.ticketSaleStatus === "offsale") {
    statusMainIcon.style.backgroundColor = "red";
  }

  statusMainP.append(statusMainIcon, name.ticketSaleStatus);
  return statusMainP;
}

function addImage(name) {
  let imgUrl = name.image;
  if (imgUrl !== "no image provided") {
    let imgEl = document.createElement("img");
    imgEl.classList.add("img1");
    imgEl.src = imgUrl;

    return imgEl;
  } else {
    return null;
  }
}

function addGeneralInfo(name) {
  const generalInfoUl = document.createElement("ul");
  generalInfoUl.classList.add("info-ul");

  let childRule = name.generalInfo.childRule
    ? name.generalInfo.childRule
    : "no child rule";

  let generalRule = name.generalInfo.generalRule
    ? name.generalInfo.generalRule
    : "no general rule";

  if (name.generalInfo !== "no general Info") {
    const childTag = document.createElement("li");
    childTag.classList.add("child-rule");
    childTag.innerText = childRule;

    const generalTag = document.createElement("li");
    generalTag.classList.add("general-rule");
    generalTag.innerText = generalRule;

    generalInfoUl.appendChild(childTag);
    generalInfoUl.appendChild(generalTag);
  } else {
    const noGeneralInfo = document.createElement("li");
    noGeneralInfo.innerText = "no general Info";
    generalInfoUl.appendChild(noGeneralInfo);
  }
  return generalInfoUl;
}
function addOffice(name) {
  const officeUl = document.createElement("ul");
  officeUl.classList.add("info-ul");

  let paymentMethod = name.officeInfo.acceptedPaymentDetail
    ? name.officeInfo.acceptedPaymentDetail
    : "no payment info provided";

  let openHoursInfo = name.officeInfo.openHoursDetail
    ? name.officeInfo.openHoursDetail
    : "no office open hours info provided";

  let phoneNInfo = name.officeInfo.phoneNumberDetail
    ? name.officeInfo.phoneNumberDetail
    : "no phone number provided";

  let willCallInfo = name.officeInfo.willCallDetail
    ? name.officeInfo.willCallDetail
    : "no will call info provided";

  if (name.officeInfo !== "no office info provided") {
    const paymentEl = document.createElement("li");
    paymentEl.classList.add("payment-m");
    paymentEl.innerText = paymentMethod;

    const officeHourEl = document.createElement("li");
    officeHourEl.classList.add("office-h");
    officeHourEl.innerText = openHoursInfo;

    const phoneNumberEl = document.createElement("li");
    phoneNumberEl.classList.add("phone-n");
    phoneNumberEl.innerText = phoneNInfo;

    const willCallEl = document.createElement("li");
    willCallEl.classList.add("will-c");
    willCallEl.innerText = willCallInfo;

    officeUl.appendChild(paymentEl);
    officeUl.appendChild(officeHourEl);
    officeUl.appendChild(phoneNumberEl);
    officeUl.appendChild(willCallEl);
  } else {
    const noOfficeInfo = document.createElement("li");
    noOfficeInfo.innerText = "no office info provided";
    officeUl.appendChild(noOfficeInfo);
  }
  return officeUl;
}

function addAddress(name) {
  let address = document.createElement("p");
  address.classList.add("address");

  const venue = name.venues[0];
  let addressParts = [];

  if (venue.address && venue.address !== "no address") {
    addressParts.push(venue.address);
  }

  if (venue.city) {
    addressParts.push(venue.city);
  }

  if (venue.statecode) {
    addressParts.push(venue.statecode);
  }

  if (venue.postalcode && venue.postalcode !== "no postalCode") {
    addressParts.push(venue.postalcode);
  }

  if (venue.countryname) {
    addressParts.push(venue.countryname);
  }

  address.innerText = addressParts.join(", ").trim();

  return address.innerText ? address : null;
}

function presale(name) {
  const middleInner2Cont = document.createElement("div");
  middleInner2Cont.classList.add("m-inner2-cont");

  const mInner2Label = document.createElement("p");
  mInner2Label.classList.add("inner2-label");
  mInner2Label.innerText = "Presales are available through:";
  middleInner2Cont.appendChild(mInner2Label);

  if (Array.isArray(name.presales)) {
    name.presales.forEach((presale) => {
      const presaleContainer = document.createElement("div");
      presaleContainer.classList.add("presale-cont");

      const providerName = document.createElement("p");
      providerName.classList.add("provide-name");
      providerName.innerText = presale.presaleName;

      const presaleStart = document.createElement("p");
      presaleStart.classList.add("preS-start-p");

      const startSpan = document.createElement("span");
      startSpan.classList.add("presale-start-span");
      startSpan.innerText = presale.preStartTime;
      presaleStart.append("Starts:", startSpan);

      const presaleEnd = document.createElement("p");
      presaleEnd.classList.add("preS-end-p");

      const endSpan = document.createElement("span");
      endSpan.classList.add("presale-end-span");
      endSpan.innerText = presale.preEndTime;

      presaleEnd.append("Ends:", endSpan);

      presaleContainer.appendChild(providerName);
      presaleContainer.appendChild(presaleStart);
      presaleContainer.appendChild(presaleEnd);

      middleInner2Cont.appendChild(presaleContainer);
    });
  } else {
    const noPreSaleInfo = document.createElement("p");
    noPreSaleInfo.classList.add("provide-name");
    noPreSaleInfo.textContent = "No presale information available";
    middleInner2Cont.appendChild(noPreSaleInfo);
  }
  return middleInner2Cont;
}

function addDropMenuValues(dropmenuArr) {
  addFirstOption();
  dropmenuArr.forEach((value) => {
    let optionTag = document.createElement("option");
    optionTag.innerText = value;
    optionTag.value = value.toLowerCase();
    dropMenu.appendChild(optionTag);
  });
  checkTooltipVisibility();
}

function addFirstOption() {
  const firstOption = dropMenu.querySelector('option[value="all"]');
  dropMenu.innerHTML = "";
  if (firstOption) {
    dropMenu.appendChild(firstOption);
  }
}

function toggleTooltipVisibility(shouldShow) {
  if (shouldShow) {
    dropmenuTooltip.classList.remove("disabled-tooltip");
  } else {
    dropmenuTooltip.classList.add("disabled-tooltip");
  }
}

function checkTooltipVisibility() {
  const isFormEmpty = formInputEl.value.trim() === "";
  const isDropMenuEmpty = dropMenu.options.length <= 1;

  if ((isFormEmpty && !hasRetrievedData) || isDropMenuEmpty) {
    dropmenuTooltip.classList.remove("disabled-tooltip");
    dropmenuTooltip.setAttribute("aria-hidden", "false");
  } else {
    dropmenuTooltip.classList.add("disabled-tooltip");
    dropmenuTooltip.setAttribute("aria-hidden", "true");
  }
}

function fixNav() {
  if (window.scrollY > 50) {
    document.body.classList.add("fixed-nav");
    headercontEl.style.width = "100%";
  } else {
    document.body.classList.remove("fixed-nav");
    headercontEl.style.width = "calc(100% - 40px)";
  }
}

function popupBtn() {
  buttons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const target = e.target.dataset.target;
      const popupEl = document.querySelector(target);

      if (popupEl !== null) {
        popupEl.classList.toggle("is-active");
        document.documentElement.classList.toggle("no-scroll");
      }
    });
  });
}

function disabledDropMenu() {
  dropMenu.disabled = true;
  checkTooltipVisibility();
}

function enabledDropMenu() {
  dropMenu.disabled = false;
  checkTooltipVisibility();
}

function changeRadioBg() {
  const Infocontainers = document.querySelectorAll(".main");

  Infocontainers.forEach((container) => {
    const radioButtons = container.querySelectorAll(".radioBtn");
    const manualBtns = container.querySelectorAll(".manual-btn");
    if (manualBtns.length > 0) {
      manualBtns[0].style.backgroundColor = "#ccc";
    }
    radioButtons.forEach((radioBtn, index) => {
      radioBtn.addEventListener("change", () => {
        // Reset background color
        manualBtns.forEach((btn) => {
          btn.style.backgroundColor = "";
        });
        if (radioBtn.checked) {
          manualBtns[index].style.backgroundColor = "#ccc";
        }
      });
    });
  });
}

function accordionFuntion(accordion) {
  accordion.forEach((item, index) => {
    let header = item.querySelector("header");
    header.addEventListener("click", () => {
      item.classList.toggle("open");
      if (item.classList.contains("second")) {
        let information2 = item.querySelector(".information2");
        if (item.classList.contains("open")) {
          information2.style.height = `${information2.scrollHeight}px`;
          item
            .querySelector("i")
            .classList.replace("ri-add-circle-fill", "ri-close-circle-fill");
        } else {
          information2.style.height = "0px";
          item
            .querySelector("i")
            .classList.replace("ri-close-circle-fill", "ri-add-circle-fill");
        }
      } else {
        let information = item.querySelector(".information");
        if (item.classList.contains("open")) {
          information.style.height = `${information.scrollHeight}px`;
          item
            .querySelector("i")
            .classList.replace("ri-add-circle-fill", "ri-close-circle-fill");
        } else {
          information.style.height = "0px";
          item
            .querySelector("i")
            .classList.replace("ri-close-circle-fill", "ri-add-circle-fill");
        }
      }
      removeOpen(index, accordion);
    });
  });
}

//switch between accordions
function removeOpen(index1, accordion) {
  accordion.forEach((item2, index2) => {
    if (item2.classList.contains("second")) {
      if (index1 !== index2) {
        item2.classList.remove("open");
        let info2 = item2.querySelector(".information2");
        info2.style.height = "0px";
        item2
          .querySelector("i")
          .classList.replace("ri-close-circle-fill", "ri-add-circle-fill");
      }
    } else {
      if (index1 !== index2) {
        item2.classList.remove("open");
        let info1 = item2.querySelector(".information");
        info1.style.height = "0px";
        item2
          .querySelector("i")
          .classList.replace("ri-close-circle-fill", "ri-add-circle-fill");
      }
    }
  });
}
