import React, { useState } from 'react';
import {
  View, Text, TextInput, Button, Image,
  StyleSheet, ActivityIndicator, ScrollView, Alert
} from 'react-native';

export default function App() {
  const [language, setLanguage] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    nombre: '',
    edad: '',
    sexo: '',
    alergias: '',
    medicamentos: ''
  });
  const [resultado, setResultado] = useState('');
  const [loading, setLoading] = useState(false);

  const labels = {
    es: {
      start: 'Comenzar',
      name: '¿Cuál es tu nombre?',
      age: '¿Cuántos años tienes?',
      gender: '¿Cuál es tu sexo?',
      male: 'Masculino',
      female: 'Femenino',
      allergies: '¿Tienes alguna alergia?',
      meds: '¿Estás tomando medicamentos actualmente?',
      recommendation: 'Recomendación de vitamina',
      restart: 'Volver a comenzar',
      terms: `Nota importante:
Las recomendaciones de este app son de carácter general y no sustituyen el consejo profesional de un farmacéutico o médico.
Siempre consulte con un farmacéutico licenciado antes de iniciar cualquier medicamento o suplemento, especialmente si está tomando otros medicamentos, tiene condiciones médicas, está embarazada o lactando.

Este app no está diseñado para diagnosticar, tratar, curar ni prevenir ninguna enfermedad.

En cumplimiento con las leyes del Estado de Florida, solo un farmacéutico licenciado puede brindar asesoramiento clínico personalizado.`,
      accept: 'Acepto los términos y condiciones'
    },
    en: {
      start: 'Start',
      name: 'What is your name?',
      age: 'How old are you?',
      gender: 'What is your gender?',
      male: 'Male',
      female: 'Female',
      allergies: 'Do you have any allergies?',
      meds: 'Are you taking any medications?',
      recommendation: 'Vitamin Recommendation',
      restart: 'Start Over',
      terms: `Important note:
The recommendations provided by this app are general and do not replace the professional advice of a pharmacist or physician.
Always consult a licensed pharmacist before starting any medication or supplement, especially if you are taking other medications, have medical conditions, are pregnant or nursing.

This app is not intended to diagnose, treat, cure, or prevent any disease.

In compliance with Florida law, only a licensed pharmacist can provide personalized clinical advice.`,
      accept: 'I accept the terms and conditions'
    }
  };

  const t = labels[language];

  const handleInput = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setStep(prev => prev + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
        const res = await fetch('https://asistente-locatel.onrender.com/recomendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData })
      });
      const data = await res.json();
      setResultado(data.resultado);
    } catch (err) {
      setResultado("Error al obtener la recomendación.");
    }
    setLoading(false);
    setStep(6);
  };

  const restart = () => {
    setFormData({ nombre: '', edad: '', sexo: '', alergias: '', medicamentos: '' });
    setResultado('');
    setLanguage('');
    setAcceptedTerms(false);
    setStep(0);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('./assets/locatel-logo.png')} style={styles.logo} />

      {!language && (
        <View style={styles.langSelect}>
          <Button title="Español" onPress={() => setLanguage('es')} />
          <Button title="English" onPress={() => setLanguage('en')} />
        </View>
      )}

      {language && !acceptedTerms && (
        <View style={styles.termsBox}>
          <Text style={styles.termsText}>{t.terms}</Text>
          <Button title={t.accept} onPress={() => setAcceptedTerms(true)} />
        </View>
      )}

      {acceptedTerms && step === 0 && (
        <Button title={t.start} onPress={() => setStep(1)} />
      )}

      {step === 1 && (
        <View>
          <Text>{t.name}</Text>
          <TextInput
            style={styles.input}
            value={formData.nombre}
            onChangeText={text => handleInput('nombre', text)}
          />
        </View>
      )}

      {step === 2 && (
        <View>
          <Text>{t.age}</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={formData.edad}
            onChangeText={text => handleInput('edad', text)}
          />
        </View>
      )}

      {step === 3 && (
        <View>
          <Text>{t.gender}</Text>
          <Button title={t.male} onPress={() => handleInput('sexo', 'Masculino')} />
          <Button title={t.female} onPress={() => handleInput('sexo', 'Femenino')} />
        </View>
      )}

      {step === 4 && (
        <View>
          <Text>{t.allergies}</Text>
          <TextInput
            style={styles.input}
            value={formData.alergias}
            onChangeText={text => handleInput('alergias', text)}
          />
        </View>
      )}

      {step === 5 && (
        <View>
          <Text>{t.meds}</Text>
          <TextInput
            style={styles.input}
            value={formData.medicamentos}
            onChangeText={text => setFormData(prev => ({ ...prev, medicamentos: text }))}
            onBlur={handleSubmit}
          />
        </View>
      )}

      {loading && <ActivityIndicator size="large" color="#00ff00" />}

      {step === 6 && (
        <View>
          <Text style={styles.resultTitle}>{t.recommendation}</Text>
          <Text>{resultado}</Text>
          <Button title={t.restart} onPress={restart} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  logo: { width: 200, height: 80, resizeMode: 'contain', marginBottom: 20 },
  langSelect: { flexDirection: 'row', justifyContent: 'space-between', width: '80%' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, width: '100%', marginBottom: 15 },
  termsBox: { padding: 10 },
  termsText: { marginBottom: 20, textAlign: 'center' },
  resultTitle: { fontSize: 20, fontWeight: 'bold', marginVertical: 10 }
});
