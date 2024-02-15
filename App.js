import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, Pressable, TextInput, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import base64 from 'react-native-base64';

export default function App() {

  const [photoAsset, setPhotoAsset] = useState(null);
  const [title, setTitle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const host = 'https://nscc-0304263-wordpress-photos.azurewebsites.net';
  const username = 'W0304263';
  const apiPassword = 'eWZG kY62 OTzs pMqf rZZ2 GMxM';

  // Choose an image from the camera roll
  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1,1],
      quality: 1,
    });

    if (!result.canceled) {
      setPhotoAsset(result.assets[0]);
    }
  }

  // Upload image to WordPress
  const uploadImage = async () => {
    const endPoint = host + '/wp-json/wp/v2/media';
    const fileName = photoAsset.uri.split('/').pop();
    const formData = new FormData();

    formData.append('file', { 
      uri: photoAsset.uri,
      name: fileName
    });

    const result = await fetch(endPoint, {
      method: 'POST',
      headers: {        
        'Content-disposition': 'formdata; filename=' + fileName,
        'Authorization': 'Basic ' + base64.encode(username + ':' + apiPassword)
      },
      body: formData
    });
    console.log(result);
    const response = await result.json();
    console.log(response);
    const mediaId = response.id;
    
    return mediaId;
  }

  // Create the Post in WordPress
  const createPost = async () => {

    if(!title || !photoAsset) {
      alert('Please complete all fields and choose an image.');
    }
    else {
      // Show spinner
      //setIsLoading(true);

      // Upload media and get the Id
      const mediaId = await uploadImage();


      //
      // Create new Post in WordPress
      //
      /*const endPoint = host + '/wp-json/wp/v2/posts';

      const formData = new FormData();
      formData.append('title', title);
      formData.append('status', 'publish');
      formData.append('featured_media', mediaId);

      // WordPress Api call
      const result = await fetch(endPoint, {
        method: 'POST',
        headers: {        
          'Authorization': 'Basic ' + base64.encode(username + ':' + apiPassword)
        },
        body: formData
      });

      const response = await result.json();

      if(response.id){
        alert('Your post was sucessfully created. Post Id: ' + response.id);
      }
      else{
        alert('Opps, something went wrong.');
      }

      setIsLoading(false);*/
    }


  }


  // Return the UI
  return (
    <ScrollView>
      <View style={styles.container}>

        <Pressable style={styles.button} onPress={pickPhoto}>
          <Text style={styles.buttonText}>Choose Image</Text>
        </Pressable>

        { photoAsset && <Image source={{ uri: photoAsset.uri }} style={styles.imageNewPost}></Image>}

        <TextInput
          style={ styles.textInput }
          placeholder='Post Title'
          onChangeText={ text => setTitle(text)}></TextInput>

        <Pressable style={styles.buttonSubmit} onPress={createPost}>
          <Text style={styles.buttonText}>Create Post</Text>
        </Pressable>

        { isLoading && <ActivityIndicator></ActivityIndicator> }

      </View>
    </ScrollView>    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    marginTop: 50
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: 'slateblue',
    marginBottom: 10,
  },
  buttonSubmit: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: 'teal',
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: 0.25,
    color: 'white',
  },
  imageNewPost: {
    width: 200,
    height: 200,
    marginBottom: 10
  },
  textInput: {
    height: 40,
    marginBottom: 10,
    borderWidth: 1,
    padding: 10,
    width: 300,
  }
});
