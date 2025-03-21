import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import React, { useState, useRef } from "react";
import { Rating } from "react-native-ratings";
import { Colors } from "../../constants/Colors";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db } from "../../configs/FirebaseConfig";
import { useUser } from "@clerk/clerk-expo";
import Toast from "react-native-toast-message";
import { SimpleLineIcons } from "@expo/vector-icons";
import { useTheme } from "../../utils/ThemeProvider";

export default function Reviews({ tutorialDetail }) {
  const [rating, setRating] = useState(5);
  const [userInput, setUserInput] = useState("");
  const [reviews, setReviews] = useState(tutorialDetail?.reviews || []);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editInput, setEditInput] = useState("");
  const { user } = useUser();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  // Handler for outside click
  const handleOutsideClick = () => {
    if (activeDropdown !== null) {
      setActiveDropdown(null);
    }
    Keyboard.dismiss();
  };

  const onSubmitReview = async () => {
    const newReview = {
      rating: rating,
      comment: userInput,
      userName: user?.fullName,
      userImage: user?.imageUrl,
      userEmail: user?.primaryEmailAddress?.emailAddress,
    };

    try {
      const docRef = doc(db, "CalisTutorials", tutorialDetail?.id);
      await updateDoc(docRef, {
        reviews: arrayUnion(newReview),
      });

      setReviews((prevReviews) => [...prevReviews, newReview]);
      setUserInput("");
      setRating(5);

      Toast.show({
        type: "success",
        text1: "Comment Added Successfully!",
      });
    } catch (error) {
      console.error("Error adding review:", error);
      Toast.show({
        type: "error",
        text1: "Failed to add comment. Please try again.",
      });
    }
  };

  const handleDeleteComment = async (comment) => {
    try {
      const docRef = doc(db, "CalisTutorials", tutorialDetail?.id);
      await updateDoc(docRef, {
        reviews: arrayRemove(comment),
      });

      setReviews((prevReviews) =>
        prevReviews.filter(
          (review) =>
            review.comment !== comment.comment ||
            review.userEmail !== comment.userEmail
        )
      );

      Toast.show({
        type: "success",
        text1: "Comment deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      Toast.show({
        type: "error",
        text1: "Failed to delete comment",
      });
    }
    setActiveDropdown(null);
  };

  const handleEditComment = async (oldComment) => {
    if (!editInput.trim()) {
      Toast.show({
        type: "error",
        text1: "Comment cannot be empty",
      });
      return;
    }

    try {
      const docRef = doc(db, "CalisTutorials", tutorialDetail?.id);

      // Remove old comment
      await updateDoc(docRef, {
        reviews: arrayRemove(oldComment),
      });

      // Add updated comment
      const updatedComment = {
        ...oldComment,
        comment: editInput,
      };

      await updateDoc(docRef, {
        reviews: arrayUnion(updatedComment),
      });

      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.comment === oldComment.comment &&
          review.userEmail === oldComment.userEmail
            ? updatedComment
            : review
        )
      );

      Toast.show({
        type: "success",
        text1: "Comment updated successfully",
      });

      setEditingComment(null);
      setEditInput("");
      setActiveDropdown(null);
    } catch (error) {
      console.error("Error updating comment:", error);
      Toast.show({
        type: "error",
        text1: "Failed to update comment",
      });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleOutsideClick}>
      <View style={[styles.container, isDarkMode && styles.containerDark]}>
        <Text style={[styles.title, isDarkMode && styles.titleDark]}>
          Reviews
        </Text>
        <View>
          <View style={[styles.ratingCont]}>
            <Rating
              showRating={false}
              imageSize={20}
              onFinishRating={(rating) => setRating(rating)}
              startingValue={5}
              tintColor={isDarkMode ? Colors.dark.surface : "#fff"}
            />
          </View>
          <TextInput
            placeholder="Write your comment"
            numberOfLines={4}
            multiline={true}
            value={userInput}
            onChangeText={(value) => setUserInput(value)}
            style={styles.txtInput}
          />
          <TouchableOpacity
            style={[styles.submitCont, !userInput && styles.submitContDisabled]}
            disabled={!userInput}
            onPress={onSubmitReview}
          >
            <Text style={styles.submitTxt}>Submit</Text>
          </TouchableOpacity>
        </View>
        <View>
          {reviews.map((item, index) => (
            <View style={styles.mapCont} key={index}>
              <Image
                source={{ uri: item.userImage }}
                style={styles.imgUserCmt}
              />
              <View style={styles.cmtCont}>
                <View style={styles.headerRow}>
                  <Text
                    style={[styles.usrNme, isDarkMode && styles.usrNmeDark]}
                  >
                    {item.userName}
                  </Text>
                  {item.userEmail ===
                    user?.primaryEmailAddress?.emailAddress && (
                    <View>
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation(); // Prevent the outside click handler
                          setActiveDropdown(
                            index === activeDropdown ? null : index
                          );
                        }}
                      >
                        <SimpleLineIcons
                          name="options-vertical"
                          size={15}
                          color={
                            isDarkMode ? "rgba(255,255,255,0.7)" : Colors.GRAY
                          }
                        />
                      </TouchableOpacity>
                      {activeDropdown === index && (
                        <View style={styles.dropdown}>
                          <TouchableOpacity
                            style={styles.dropdownItem}
                            onPress={(e) => {
                              e.stopPropagation(); // Prevent the outside click handler
                              setEditingComment(item);
                              setEditInput(item.comment);
                              setActiveDropdown(null);
                            }}
                          >
                            <Text style={styles.dropdownText}>Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.dropdownItem}
                            onPress={(e) => {
                              e.stopPropagation(); // Prevent the outside click handler
                              Alert.alert(
                                "Delete Comment",
                                "Are you sure you want to delete this comment?",
                                [
                                  {
                                    text: "Cancel",
                                    style: "cancel",
                                  },
                                  {
                                    text: "Delete",
                                    onPress: () => handleDeleteComment(item),
                                    style: "destructive",
                                  },
                                ]
                              );
                            }}
                          >
                            <Text
                              style={[styles.dropdownText, styles.deleteText]}
                            >
                              Delete
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )}
                </View>
                <Rating
                  imageSize={20}
                  ratingCount={item.rating}
                  style={styles.ratCmt}
                  readonly={true}
                  startingValue={item.rating}
                  tintColor={isDarkMode ? Colors.dark.surface : "#fff"}
                />
                {editingComment?.comment === item.comment ? (
                  <View>
                    <TextInput
                      value={editInput}
                      onChangeText={setEditInput}
                      style={[
                        styles.editInput,
                        isDarkMode && styles.editInputDark,
                      ]}
                      multiline
                    />
                    <View style={styles.editActions}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleEditComment(item)}
                      >
                        <Text style={styles.editButtonText}>Save</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.editButton,
                          styles.cancelButton,
                          isDarkMode && styles.cancelButtonDark,
                        ]}
                        onPress={() => {
                          setEditingComment(null);
                          setEditInput("");
                        }}
                      >
                        <Text
                          style={[
                            styles.editButtonText,
                            isDarkMode && styles.editButtonTextDark,
                          ]}
                        >
                          Cancel
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <Text
                    style={[styles.cmtTxt, isDarkMode && styles.cmtTxtDark]}
                  >
                    {item.comment}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  containerDark: {
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  title: {
    fontFamily: "outfit-bold",
    fontSize: 20,
  },
  titleDark: {
    color: Colors.dark.text,
  },
  ratingCont: {
    paddingVertical: 10,
  },
  txtInput: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    borderColor: Colors.GRAY,
    backgroundColor: "#fff",
    textAlignVertical: "top",
    height: 95,
  },
  submitCont: {
    padding: 10,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 6,
    marginTop: 10,
  },
  submitContDisabled: {
    opacity: 0.6,
  },
  submitTxt: {
    fontFamily: "outfit",
    color: "#fff",
    textAlign: "center",
  },
  imgUserCmt: {
    width: 50,
    height: 50,
    borderRadius: 99,
  },
  cmtCont: {
    display: "flex",
    gap: 5,
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  ratCmt: {
    alignItems: "flex-start",
  },
  mapCont: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.GRAY,
    borderRadius: 15,
    marginTop: 10,
  },
  usrNme: {
    fontFamily: "outfit-medium",
  },
  usrNmeDark: {
    color: Colors.dark.text,
  },
  cmtTxt: {
    fontFamily: "outfit",
  },
  cmtTxtDark: {
    color: Colors.dark.text,
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: 20,
    backgroundColor: "#fff",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Colors.GRAY,
    zIndex: 1000,
    width: 65,
  },
  dropdownItem: {
    padding: 7,
  },
  dropdownText: {
    fontFamily: "outfit",
    fontSize: 14,
  },
  deleteText: {
    color: "#d90429",
  },
  editInput: {
    borderWidth: 1,
    borderColor: Colors.GRAY,
    borderRadius: 5,
    padding: 8,
    fontFamily: "outfit",
    marginTop: 5,
  },
  editInputDark: {
    backgroundColor: "#fff",
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 5,
  },
  editButton: {
    backgroundColor: Colors.PRIMARY,
    padding: 6,
    borderRadius: 5,
    minWidth: 60,
  },
  cancelButton: {
    backgroundColor: Colors.GRAY,
  },
  cancelButtonDark: {
    backgroundColor: "#fff",
  },
  editButtonText: {
    color: "#fff",
    textAlign: "center",
    fontFamily: "outfit",
  },
  editButtonTextDark: {
    color: "#000",
  },
});
