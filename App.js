import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Image } from 'react-native';

export default function App() {

  // Url for get all posts
  //https://nscc-0304263-wordpress-photos.azurewebsites.net/wp-json/wp/v2/posts?_fields=id,title,link,_links&_embed=author,wp:featuredmedia

  const host = 'https://nscc-0304263-wordpress-photos.azurewebsites.net/';
  const [posts, setPosts] = useState(null);

  // Retrieve posts from Api
  const getPosts = async () => {
    const postsUrl = host + 'wp-json/wp/v2/posts?_fields=id,title,link,_links&_embed=author,wp:featuredmedia';
    const response = await fetch(postsUrl);
    const posts = await response.json();
    return posts;
  }

  // useEffect to load the posts
  useEffect(() => {
      getPosts().then(posts => {
        setPosts(posts);
      });
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView>
        {posts && posts.map(post => (
          <>
            <Image source={{uri: host + post._embedded['wp:featuredmedia'][0].source_url}} style={{width: 400, height: 400}}></Image>
            <Text key={post.id}>{post.title.rendered}</Text>
            <Text>{post._embedded.author[0].name}</Text>
          </>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    marginBottom: 50,
    padding: 5
  },
});
