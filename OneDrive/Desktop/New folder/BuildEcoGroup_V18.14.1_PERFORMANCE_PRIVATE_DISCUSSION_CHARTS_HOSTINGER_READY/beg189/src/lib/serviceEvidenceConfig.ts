export interface EvidenceShotOption {
  id: string;
  labelEn: string;
  labelHi: string;
  hintEn: string;
  hintHi: string;
}

export interface MeasurementField {
  key: string;
  labelEn: string;
  labelHi: string;
  unit: string;
  placeholder: string;
}

export interface SiteMeasurementEntry {
  key: string;
  label: string;
  value: string;
  unit: string;
}

export interface ServiceEvidenceGuide {
  titleEn: string;
  titleHi: string;
  descriptionEn: string;
  descriptionHi: string;
  shots: EvidenceShotOption[];
  measurements: MeasurementField[];
}

const INTERIOR_GUIDE: ServiceEvidenceGuide = {
  titleEn: 'Interior photo & measurement checklist',
  titleHi: 'इंटीरियर फोटो और माप चेकलिस्ट',
  descriptionEn: 'Photograph the room from each angle and add the measurements you can safely take.',
  descriptionHi: 'कमरे की हर दिशा से फोटो लें और जो माप सुरक्षित रूप से ले सकें, उन्हें जोड़ें।',
  shots: [
    { id: 'room-overview', labelEn: 'Full room / entrance', labelHi: 'पूरा कमरा / प्रवेश', hintEn: 'Stand at the entrance and include the full space.', hintHi: 'प्रवेश पर खड़े होकर पूरा स्थान फोटो में लें।' },
    { id: 'wall-one', labelEn: 'Wall 1', labelHi: 'दीवार 1', hintEn: 'Capture the main feature wall straight-on.', hintHi: 'मुख्य दीवार की सीधी फोटो लें।' },
    { id: 'wall-two', labelEn: 'Wall 2', labelHi: 'दीवार 2', hintEn: 'Capture the opposite wall straight-on.', hintHi: 'सामने वाली दीवार की सीधी फोटो लें।' },
    { id: 'ceiling', labelEn: 'Ceiling & lights', labelHi: 'छत और लाइट', hintEn: 'Show the ceiling, beams, fans and light points.', hintHi: 'छत, बीम, पंखे और लाइट पॉइंट दिखाएँ।' },
    { id: 'floor', labelEn: 'Floor condition', labelHi: 'फर्श की स्थिति', hintEn: 'Show floor finish, level changes and damage.', hintHi: 'फर्श की फिनिश, लेवल और खराबी दिखाएँ।' },
    { id: 'services', labelEn: 'Doors, windows & services', labelHi: 'दरवाज़े, खिड़की और सर्विस', hintEn: 'Include electrical, plumbing, doors and windows.', hintHi: 'बिजली, प्लंबिंग, दरवाज़े और खिड़की दिखाएँ।' },
  ],
  measurements: [
    { key: 'roomLength', labelEn: 'Room length', labelHi: 'कमरे की लंबाई', unit: 'ft', placeholder: 'e.g. 14' },
    { key: 'roomWidth', labelEn: 'Room width', labelHi: 'कमरे की चौड़ाई', unit: 'ft', placeholder: 'e.g. 11' },
    { key: 'ceilingHeight', labelEn: 'Ceiling height', labelHi: 'छत की ऊँचाई', unit: 'ft', placeholder: 'e.g. 10' },
    { key: 'doorWindowWidth', labelEn: 'Door / window width', labelHi: 'दरवाज़ा / खिड़की चौड़ाई', unit: 'ft', placeholder: 'e.g. 4' },
  ],
};

const SOLAR_GUIDE: ServiceEvidenceGuide = {
  titleEn: 'Solar rooftop survey checklist',
  titleHi: 'सोलर रूफटॉप सर्वे चेकलिस्ट',
  descriptionEn: 'Show usable roof area, shade, access and the electrical connection point.',
  descriptionHi: 'उपयोगी छत, छाया, पहुँच और बिजली कनेक्शन पॉइंट दिखाएँ।',
  shots: [
    { id: 'roof-overview', labelEn: 'Full roof overview', labelHi: 'पूरी छत', hintEn: 'Capture the full usable roof from a safe position.', hintHi: 'सुरक्षित स्थान से पूरी उपयोगी छत की फोटो लें।' },
    { id: 'sun-edge', labelEn: 'Sun-facing edge', labelHi: 'धूप वाली दिशा', hintEn: 'Show the roof edge receiving the longest sunlight.', hintHi: 'सबसे अधिक धूप पाने वाली छत की दिशा दिखाएँ।' },
    { id: 'shade', labelEn: 'Shade & obstructions', labelHi: 'छाया और रुकावट', hintEn: 'Include tanks, trees, walls or nearby buildings.', hintHi: 'टंकी, पेड़, दीवार या पास की इमारत दिखाएँ।' },
    { id: 'meter', labelEn: 'Electric meter / panel', labelHi: 'बिजली मीटर / पैनल', hintEn: 'Capture the meter and distribution panel without exposing personal bills.', hintHi: 'व्यक्तिगत बिल दिखाए बिना मीटर और पैनल की फोटो लें।' },
    { id: 'roof-access', labelEn: 'Roof access route', labelHi: 'छत तक पहुँच', hintEn: 'Show stairs, ladder access and material movement path.', hintHi: 'सीढ़ी और सामान पहुँचाने का रास्ता दिखाएँ।' },
  ],
  measurements: [
    { key: 'roofLength', labelEn: 'Usable roof length', labelHi: 'उपयोगी छत लंबाई', unit: 'ft', placeholder: 'e.g. 30' },
    { key: 'roofWidth', labelEn: 'Usable roof width', labelHi: 'उपयोगी छत चौड़ाई', unit: 'ft', placeholder: 'e.g. 20' },
    { key: 'clearArea', labelEn: 'Approx. clear area', labelHi: 'अनुमानित खुला क्षेत्र', unit: 'sq ft', placeholder: 'e.g. 500' },
    { key: 'parapetHeight', labelEn: 'Parapet height', labelHi: 'पैरापेट ऊँचाई', unit: 'ft', placeholder: 'e.g. 3' },
  ],
};

const LAND_GUIDE: ServiceEvidenceGuide = {
  titleEn: 'Land / property evidence checklist',
  titleHi: 'भूमि / प्रॉपर्टी प्रमाण चेकलिस्ट',
  descriptionEn: 'Capture boundaries, access, surroundings and attach the exact site location.',
  descriptionHi: 'सीमा, पहुँच, आसपास का क्षेत्र और सटीक साइट लोकेशन जोड़ें।',
  shots: [
    { id: 'front-boundary', labelEn: 'Front boundary', labelHi: 'सामने की सीमा', hintEn: 'Show the complete frontage and visible boundary marks.', hintHi: 'पूरा फ्रंट और सीमा चिन्ह दिखाएँ।' },
    { id: 'approach-road', labelEn: 'Approach road', labelHi: 'पहुँच मार्ग', hintEn: 'Capture road condition and width from the site entrance.', hintHi: 'साइट प्रवेश से सड़क की स्थिति और चौड़ाई दिखाएँ।' },
    { id: 'plot-corners', labelEn: 'Plot corners', labelHi: 'प्लॉट के कोने', hintEn: 'Capture corner markers and boundary direction.', hintHi: 'कोने के निशान और सीमा की दिशा दिखाएँ।' },
    { id: 'surroundings', labelEn: 'Surroundings', labelHi: 'आसपास का क्षेत्र', hintEn: 'Show adjacent plots, buildings, drains and utilities.', hintHi: 'पास के प्लॉट, भवन, नाली और सुविधाएँ दिखाएँ।' },
    { id: 'landmark', labelEn: 'Nearest landmark', labelHi: 'नज़दीकी लैंडमार्क', hintEn: 'Capture a recognizable nearby landmark without personal data.', hintHi: 'व्यक्तिगत जानकारी के बिना नज़दीकी पहचान योग्य स्थान दिखाएँ।' },
  ],
  measurements: [
    { key: 'plotLength', labelEn: 'Plot length', labelHi: 'प्लॉट लंबाई', unit: 'ft', placeholder: 'e.g. 80' },
    { key: 'plotWidth', labelEn: 'Plot width', labelHi: 'प्लॉट चौड़ाई', unit: 'ft', placeholder: 'e.g. 40' },
    { key: 'frontage', labelEn: 'Road frontage', labelHi: 'रोड फ्रंटेज', unit: 'ft', placeholder: 'e.g. 40' },
    { key: 'roadWidth', labelEn: 'Approach road width', labelHi: 'पहुँच मार्ग चौड़ाई', unit: 'ft', placeholder: 'e.g. 30' },
  ],
};

const CONSTRUCTION_GUIDE: ServiceEvidenceGuide = {
  titleEn: 'Construction site evidence checklist',
  titleHi: 'निर्माण साइट प्रमाण चेकलिस्ट',
  descriptionEn: 'Show the work area, current stage, access and any issue that needs an expert review.',
  descriptionHi: 'कार्य क्षेत्र, मौजूदा स्टेज, पहुँच और विशेषज्ञ समीक्षा वाला विषय दिखाएँ।',
  shots: [
    { id: 'site-overview', labelEn: 'Site / building overview', labelHi: 'साइट / भवन का पूरा दृश्य', hintEn: 'Capture the full work area from a safe distance.', hintHi: 'सुरक्षित दूरी से पूरा कार्य क्षेत्र दिखाएँ।' },
    { id: 'current-stage', labelEn: 'Current construction stage', labelHi: 'मौजूदा निर्माण स्टेज', hintEn: 'Show structural, masonry or finishing progress.', hintHi: 'स्ट्रक्चर, चिनाई या फिनिशिंग की प्रगति दिखाएँ।' },
    { id: 'concern', labelEn: 'Issue / concern close-up', labelHi: 'समस्या का क्लोज़-अप', hintEn: 'Capture cracks, seepage or workmanship concerns closely.', hintHi: 'दरार, सीलन या कार्य गुणवत्ता की समस्या पास से दिखाएँ।' },
    { id: 'access', labelEn: 'Site access', labelHi: 'साइट पहुँच', hintEn: 'Show the access road and material movement area.', hintHi: 'पहुँच मार्ग और सामग्री आने-जाने की जगह दिखाएँ।' },
  ],
  measurements: [
    { key: 'workLength', labelEn: 'Work area length', labelHi: 'कार्य क्षेत्र लंबाई', unit: 'ft', placeholder: 'e.g. 50' },
    { key: 'workWidth', labelEn: 'Work area width', labelHi: 'कार्य क्षेत्र चौड़ाई', unit: 'ft', placeholder: 'e.g. 30' },
    { key: 'floorHeight', labelEn: 'Floor height', labelHi: 'फ्लोर ऊँचाई', unit: 'ft', placeholder: 'e.g. 10' },
    { key: 'accessWidth', labelEn: 'Access width', labelHi: 'पहुँच चौड़ाई', unit: 'ft', placeholder: 'e.g. 12' },
  ],
};

const GENERIC_GUIDE: ServiceEvidenceGuide = {
  titleEn: 'Site photo & measurement checklist',
  titleHi: 'साइट फोटो और माप चेकलिस्ट',
  descriptionEn: 'Add clear context photos, useful measurements and the optional GPS location.',
  descriptionHi: 'स्पष्ट फोटो, उपयोगी माप और वैकल्पिक GPS लोकेशन जोड़ें।',
  shots: [
    { id: 'overview', labelEn: 'Site overview', labelHi: 'साइट का पूरा दृश्य', hintEn: 'Show the full area where service is required.', hintHi: 'जहाँ सेवा चाहिए उस पूरे क्षेत्र को दिखाएँ।' },
    { id: 'detail', labelEn: 'Important detail', labelHi: 'महत्वपूर्ण विवरण', hintEn: 'Capture the specific item or concern closely.', hintHi: 'ज़रूरी वस्तु या समस्या को पास से दिखाएँ।' },
    { id: 'access', labelEn: 'Access route', labelHi: 'पहुँच मार्ग', hintEn: 'Show how experts and materials can reach the site.', hintHi: 'विशेषज्ञ और सामग्री साइट तक कैसे पहुँचेंगे, दिखाएँ।' },
    { id: 'surroundings', labelEn: 'Surroundings', labelHi: 'आसपास का क्षेत्र', hintEn: 'Show nearby buildings, utilities and constraints.', hintHi: 'पास के भवन, सुविधाएँ और बाधाएँ दिखाएँ।' },
  ],
  measurements: [
    { key: 'length', labelEn: 'Approx. length', labelHi: 'अनुमानित लंबाई', unit: 'ft', placeholder: 'e.g. 20' },
    { key: 'width', labelEn: 'Approx. width', labelHi: 'अनुमानित चौड़ाई', unit: 'ft', placeholder: 'e.g. 15' },
    { key: 'height', labelEn: 'Approx. height', labelHi: 'अनुमानित ऊँचाई', unit: 'ft', placeholder: 'e.g. 10' },
  ],
};

const SERVICE_GUIDES: Record<string, ServiceEvidenceGuide> = {
  interior: INTERIOR_GUIDE,
  solar: SOLAR_GUIDE,
  land: LAND_GUIDE,
  construction: CONSTRUCTION_GUIDE,
};

export function getServiceEvidenceGuide(serviceId: string): ServiceEvidenceGuide {
  return SERVICE_GUIDES[serviceId] ?? GENERIC_GUIDE;
}

export function buildMeasurementEntries(
  guide: ServiceEvidenceGuide,
  values: Record<string, string>,
  language: 'en' | 'hi'
): SiteMeasurementEntry[] {
  return guide.measurements
    .filter((field) => values[field.key]?.trim())
    .map((field) => ({
      key: field.key,
      label: language === 'hi' ? field.labelHi : field.labelEn,
      value: values[field.key].trim().slice(0, 40),
      unit: field.unit,
    }));
}
