const explainableAICategoryTechnicalSkills = {
  prediction: {
    response: {
      company: [
        ["Express", 0.06331282767012576],
        ["Node", 0.043190711221284525],
        ["js", -0.042297098971521084],
        ["Angular", 0.03396226571629594],
        ["SQL", 0.0321950795538319],
      ],
      candidate: [
        ["React", 0.16878559332515103],
        ["SQL", 0.09182309643636197],
        ["Boot", 0.055304503219455264],
        ["Spring", -0.008904500988576236],
      ],
    },
  },
};

const explainableAICategoryEducation = {
  prediction: {
    response: {
      company: [
        ["Science", 0.14044585343226168],
        ["in", -0.08055391700924638],
        ["Computer", 0.05476964898835874],
        ["Bachelor", -0.030825770817486074],
        ["degree", -0.013659493281163705],
      ],
      candidate: [
        ["Bsc", 0.18068396545725504],
        ["in", 0.05571991103315583],
        ["Software", -0.04204692735487382],
        ["Engineering", 0.03068607613183513],
      ],
    },
  },
};

const explainableAICategorySoftSkills = {
  prediction: {
    response: {
      company: [
        ["communication", 0.1469514731000067],
        ["leadership", 0.11708145985861858],
        ["skills", -0.04381158219932918],
      ],
      candidate: [
        ["leadership", 0.33548343400203867],
        ["problem", 0.19721631949053445],
        ["solving", -0.05039916522128697],
      ],
    },
  },
};

const explainableAICategoryExperience = {
  prediction: {
    response: {
      company: [
        ["yrs", 0.09849228354330389],
        ["Skills", 0.08531226740685893],
        ["Java", 0.08115723568387688],
        ["Role", 0.07834804518151961],
        ["Duration", 0.06651879966536076],
        ["2", 0.059970172405711175],
        ["SpringBoot", 0.0409292083337877],
        ["Engineer", 0.026046920972333774],
        ["Software", 0.012747237877339104],
      ],
      candidate: [
        ["js", 0.09808039585189127],
        ["Role", 0.07894170690284733],
        ["Skills", 0.06426062683587741],
        ["Node", 0.059823930747995115],
        ["2", 0.0570120855261966],
        ["1", 0.05310804730023571],
        ["yrs", 0.049335782443385066],
        ["Duration", 0.04298878189571173],
        ["React", 0.03631162378648131],
        ["DB", 0.028888070126704486],
      ],
    },
  },
};

module.exports = { explainableAICategoryExperience, explainableAICategorySoftSkills, explainableAICategoryEducation, explainableAICategoryTechnicalSkills };