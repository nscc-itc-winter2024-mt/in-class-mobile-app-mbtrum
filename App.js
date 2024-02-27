import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, Pressable, TextInput, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import base64 from 'react-native-base64';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

//
// Home screen - list most 10 recent posts
//
function HomeScreen({ navigation }) {
  const url = "https://nscc-0304263-wordpress-photos.azurewebsites.net/wp-json/wp/v2/posts?_fields=id,title,_links&_embed=author,wp:featuredmedia";

  const [posts, setPosts] = useState([]);

  const getPosts = async () => {
    const result = await fetch(url);    
    const data = await result.json();
    setPosts(data);
  }

  if(posts.length === 0){
    getPosts();
  }  
  
  return (    
    <View style={ styles.container }>
      <Pressable style={styles.button} onPress={ () => navigation.navigate('Create') }>
          <Text style={styles.buttonText}>Add New Post</Text>
      </Pressable>

      <ScrollView style={marginTop=100}>
       {posts.map(post => (        
          <View key={post.id} style={paddingVertical=10}>
            { post._embedded['wp:featuredmedia'] && <Image source={{ uri: "https://nscc-0304263-wordpress-photos.azurewebsites.net" + post._embedded['wp:featuredmedia'][0].source_url }} style={{ width: 200, height: 200 }} /> }
            <Text>{post.title.rendered}</Text>
          </View>
          ))}    
      </ScrollView>
    </View>
  );
}

//
// Create Screen - publish a new post to website
//
function CreateScreen({ navigation }) {
  const [photoAsset, setPhotoAsset] = useState(null);
  const [title, setTitle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const host = "https://nscc-0304263-wordpress-photos.azurewebsites.net";
  const username = 'W0304263';
  const apiPassword = 'Zef4 11Xb vJ80 B0bp F4GJ GBOz';

  // Choose an image from the camera roll
  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1,1],
      quality: .75,
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
    
    const response = await result.json();
    
    const mediaId = response.id;
    console.log('Media ID: ' + mediaId);
    
    return mediaId;
  }

  // Create the Post in WordPress
  const createPost = async () => {

    if(!title || !photoAsset) {
      alert('Please complete all fields and choose an image.');
    }
    else {
      // Show spinner
      setIsLoading(true);

      // Upload media and get the Id
      const mediaId = await uploadImage();

      //
      // Create new Post in WordPress
      //
      const endPoint = host + '/wp-json/wp/v2/posts';

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

      if(response.id) {
        // Navigate back to home page
        navigation.navigate('Home');
      }
      else{
        console.log('response');
        alert('Oops, something went wrong.');        
      }

      setIsLoading(false);
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


//
// Main entry point for app
//
export default function App() {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name='Home' component={ HomeScreen } options={{ title: 'Resplash Home'}} />
          <Stack.Screen name='Create' component={ CreateScreen } options={{ title: 'Create'}}/>
        </Stack.Navigator>
      </NavigationContainer>
    )
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
