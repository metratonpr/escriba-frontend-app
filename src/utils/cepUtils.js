export const fetchCepInfo = async (cep) => {
  const cleanedCep = cep.replace(/\D/g, "");

  if (cleanedCep.length !== 8) {
    throw new Error("CEP inválido. Deve conter 8 dígitos numéricos.");
  }

  try {
    const response = await fetch(
      `https://viacep.com.br/ws/${cleanedCep}/json/`
    );

    if (!response.ok) {
      throw new Error("Erro na requisição do CEP.");
    }

    const data = await response.json();

    if (data.erro) {
      throw new Error("CEP não encontrado.");
    }

    const cityCode = data.ibge || "";
    const stateCodeNumber = cityCode.substring(0, 2);

    return {
      cep: data.cep || "", // "84174-020"
      street: data.logradouro || "", // "Rua Francisco Ferreira de Camargo"
      complement: data.complemento || "", // complemento
      neighborhood: data.bairro || "", // "Jardim Florestal"
      city: data.localidade || "", // "Castro"
      state: data.uf, // PR
      country: "Brasil", // fixo
      ibge_city_code: cityCode, // 4104907
      ibge_state_code: stateCodeNumber, // 41
      ddd: data.ddd || "", // "42"
      gia: data.gia || "", // "" (normalmente vazio)
      siafi: data.siafi || "", // "7631"
    };
  } catch (error) {
    console.error("Erro ao buscar o CEP:", error);
    throw error;
  }
};
