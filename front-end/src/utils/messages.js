const messages = {
    welcome: {
      darija: "Ana NabadyBot, bach ne9der n3awnek?",
      "الدارجة": "أنا نابادي بوت، باش نقدر نعاونك؟",
      "العربية": "أنا نابادي بوت، كيف يمكنني مساعدتك؟",
      francais: "Bonjour, je suis NabadyBot, comment puis-je vous aider?",
      english: "Hello, I am NabadyBot, how can I assist you?",
    },
    select_specialty: {
      darija: "hahoma les specialités li kaynin khtar li bghit",
      "الدارجة": "هاهوما الإختصاصات لي كينين ، ختار لي بغيتي",
      "العربية": "ها هي التخصصات المتاحة، اختر ما تريد.",
      francais: "Voici les spécialités disponibles, veuillez choisir.",
      english: "Here are the available specialties, please choose one.",
    },
    last_name: {
      darija: "Achno ism 3a2ili dyalk?",
      "الدارجة": "عافاك عطيني الإسم العائلي ديالك",
      "العربية": "من فضلك، أعطني اسمك العائلي.",
      francais: "Quel est votre nom de famille?",
      english: "What is your last name?",
    },
    phone_number: {
      darija: "3tini ra9m lhatif dyalk?",
      "الدارجة": "عافاك عطيني رقم الهاتف ديالك",
      "العربية": "من فضلك، أعطني رقم هاتفك.",
      francais: "Quel est votre numéro de téléphone?",
      english: "What is your phone number?",
    },
    confirmation: {
      darija: "t2akad liya mn ma3lomat dyalk.<br>Smitek: ${first_name},<br>Knitek: ${last_name},<br>Ra9m dyalk: ${phone_number},<br>Tbib: ${doctorName},<br>lwe9t: ${timePart},<br>Nhar: ${dayPart}",
      "الدارجة": "تأكد من المعلومات  ديالك.<br>${first_name}: اسمك الشخصي,<br>${last_name}:الإسم العائلي ,<br>الهاتف: ${phone_number},<br>${doctorName}:الطبيب ,<br>الوقت: ${timePart},<br>اليوم: ${dayPart}",
      "العربية": "تأكد من معلوماتك.<br>اسمك الشخصي: ${first_name},<br>الاسم العائلي: ${last_name},<br>الهاتف: ${phone_number},<br>الطبيب: ${doctorName},<br>الوقت: ${timePart},<br>اليوم: ${dayPart}",
      francais: "Veuillez vérifier vos informations.<br>Prénom: ${first_name},<br>Nom: ${last_name},<br>Téléphone: ${phone_number},<br>Médecin: ${doctorName},<br>Heure: ${timePart},<br>Jour: ${dayPart}",
      english: "Please verify your information.<br>First Name: ${first_name},<br>Last Name: ${last_name},<br>Phone: ${phone_number},<br>Doctor: ${doctorName},<br>Time: ${timePart},<br>Day: ${dayPart}",
    },
    confirm_doctor: {
      darija: "Chokran 7it khtariti ${doctorName} m3a ${timePart}.<br>Nhar: ${dayPart}.<br>3afak 3tini ism chakhsi dyalk.",
      "الدارجة": "شكراً حيث اخترتي <br>${doctorName} مع ${timePart}.<br>نهار: ${dayPart}.<br>عافاك عطيني الإسم الشخصي ديالك.",
      "العربية": "شكراً لاختيارك <br>${doctorName} مع ${timePart}.<br>اليوم: ${dayPart}.<br>من فضلك أعطني اسمك الشخصي.",
      francais: "Merci d'avoir choisi ${doctorName} à ${timePart}.<br>Jour: ${dayPart}.<br>Veuillez saisir votre prénom.",
      english: "Thank you for choosing ${doctorName} at ${timePart}.<br>Day: ${dayPart}.<br>Please provide your first name.",
    },
    confirm: {
      darija: "Wach had lma3lomat s7a7?  ",
      "الدارجة": "واش المعلومات صحيحة؟ ",
      "العربية": "هل المعلومات صحيحة؟ ",
      francais: "Est-ce que les informations sont correctes? ",
      english: "Are your informations correct?",
    },
    retry_first_name: {
      darija: "wakha 3awd 3tini ism chakhsi dyalk",
      "الدارجة": "حسناً، من فضلك أعد إعطائي اسمك الشخصي.",
      "العربية": "حسناً، من فضلك أعد إعطائي اسمك الشخصي.",
      francais: "D'accord, veuillez me resaisir votre prénom.",
      english: "Alright, please provide your first name again.",
    },
    sms_code: {
      darija: "daba ghadi iwaslek wahd ramz f sms , 3afak 3tih liya bach lmaw3id it2eked lik",
      "الدارجة": "دابا غادي يوصلك واحد الرمز في رسالة نصية، عافاك أعطيه ليا باش نأكدوا الموعد",
      "العربية": "سيصلك رمز في رسالة نصية، من فضلك أعطني إياه لتأكيد الموعد.",
      francais: "Vous allez recevoir un code par SMS, veuillez me le donner pour confirmer le rendez-vous.",
      english: "You will receive a code via SMS, please provide it to confirm the appointment.",
    },
    confirm_success: {
      darija: "lmaw3id t2eked lik!",
      "الدارجة": "الموعد تأكد ليك!",
      "العربية": "تم تأكيد موعدك!",
      francais: "Votre rendez-vous a été confirmé!",
      english: "Your appointment has been confirmed!",
    },
    invalid_code: {
      darija: "ramz machi s7i7, afak dekhel ramz s7i7 li weslek",
      "الدارجة": "رمز غير صحيح، من فضلك أدخل الرمز الصحيح الذي وصلك",
      "العربية": "الرمز غير صحيح، من فضلك أدخل الرمز الصحيح.",
      francais: "Code incorrect, veuillez entrer le code correct.",
      english: "Invalid code, please enter the correct code.",
    },
    confirm_error: {
      darija: "Kayn chi mouchkil, lmaw3id mat2ekedch!",
      "الدارجة": "كان هناك خطأ، الموعد لم يتأكد!",
      "العربية": "حدث خطأ، الموعد لم يتم تأكيده!",
      francais: "Une erreur est survenue, le rendez-vous n'a pas été confirmé!",
      english: "An error occurred, the appointment was not confirmed!",
    },
    error: {
      darija: "An error occurred, please try again.",
      "الدارجة": "وقع خطأ، المرجو إعادة المحاولة.",
      "العربية": "وقع خطأ، المرجو إعادة المحاولة.",
      francais: "Une erreur s'est produite, veuillez réessayer.",
      english: "An error occurred, please try again.",
    },
    default: {
      darija: "Ma fhmtsh, 3afak 3awd ghi mra.",
      "الدارجة": "مفهمتش عافاك عاود.",
      "العربية": "لم أفهم، من فضلك أعد المحاولة.",
      francais: "Je n'ai pas compris, veuillez réessayer.",
      english: "I didn't understand, please try again.",
    },
    today: {
        darija: "lyoum",
        "الدارجة": "اليوم",
        "العربية": "اليوم",
        francais: "aujourd'hui",
        english: "today",
      },
      tomorrow: {
        darija: "ghada",
        "الدارجة": "الغد",
        "العربية": "الغد",
        francais: "demain",
        english: "tomorrow",
      },
  };
  
  export const getMessageForLanguage = (language, key) => {
    return messages[key][language];
  };
  